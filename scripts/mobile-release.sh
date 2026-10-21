#!/usr/bin/env bash
# Releases the mobile apps to TestFlight and the Play internal track.
#
#   pnpm mobile:release patch|minor|major|X.Y.Z [--yes] [--dry-run] [--force]
#
# It checks that main is up to date with green CI and that native files changed since
# the last release, then pushes the tag `mobile-vX.Y.Z`. The Mobile workflow builds,
# signs and uploads from that tag. Nothing is built on this machine.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
# shellcheck source=scripts/mobile-lib.sh
. scripts/mobile-lib.sh

die() {
  echo "Error: $*" >&2
  exit 1
}

usage() {
  sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
}

target=""
assume_yes=0
dry_run=0
force=0
for arg in "$@"; do
  case "$arg" in
    --yes) assume_yes=1 ;;
    --dry-run) dry_run=1 ;;
    --force) force=1 ;;
    -h | --help) usage ;;
    -*) die "Unknown option $arg" ;;
    *) [ -z "$target" ] || die "Give one version or bump, not two."; target="$arg" ;;
  esac
done
[ -n "$target" ] || usage

for tool in gh git; do
  command -v "$tool" > /dev/null || die "$tool is not installed."
done
gh auth status > /dev/null 2>&1 || die "Not logged in to GitHub. Run: gh auth login"

[ -z "$(git status --porcelain --untracked-files=no)" ] || die "You have uncommitted changes."
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || die "Release from main (you are on $(git rev-parse --abbrev-ref HEAD))."

git fetch --quiet origin main --tags
sha="$(git rev-parse HEAD)"
[ "$sha" = "$(git rev-parse origin/main)" ] || die "main isn't up to date with origin. Run: git pull"

ci="$(gh run list --workflow ci.yml --commit "$sha" --limit 1 --json status,conclusion --jq '.[0] | "\(.status) \(.conclusion)"')"
case "$ci" in
  "") die "No CI run found for ${sha:0:7} yet. Wait for it to start." ;;
  "completed success") ;;
  "completed "*) die "CI did not pass on ${sha:0:7} ($ci)." ;;
  *) die "CI is still running on ${sha:0:7}. Try again when it is green." ;;
esac

previous="$(last_release_tag)"
previous_version="${previous#mobile-v}"

case "$target" in
  patch | minor | major)
    [ -n "$previous" ] || die "There is no earlier release to bump. Give the first version, e.g. pnpm mobile:release 0.2.0"
    version="$(next_version "$previous_version" "$target")"
    ;;
  *)
    [[ "$target" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "'$target' is not patch, minor, major or a version like 1.2.3."
    version="$target"
    ;;
esac
tag="mobile-v${version}"

if git rev-parse --verify --quiet "refs/tags/${tag}" > /dev/null || git ls-remote --exit-code --tags origin "refs/tags/${tag}" > /dev/null 2>&1; then
  die "The tag ${tag} already exists."
fi

changed="$(native_changed_files "$previous")"
dependencies="$(native_dependency_changes "$previous")"
if [ -z "$changed" ] && [ -z "$dependencies" ] && [ "$force" -eq 0 ]; then
  echo "No native files changed since ${previous:-the start}. The apps load the live site, so a web deploy already reached them."
  echo "Run with --force to release anyway."
  exit 0
fi

echo "Release  ${tag}  (${sha:0:7}, previous: ${previous:-none})"
if [ -n "$changed" ]; then
  echo "Native files changed:"
  printf '%s\n' "$changed" | sed 's/^/  /'
fi
if [ -n "$dependencies" ]; then
  echo "Capacitor plugin changes in package.json:"
  printf '%s\n' "$dependencies" | sed 's/^/  /'
fi

if [ "$dry_run" -eq 1 ]; then
  echo "Dry run: nothing was tagged."
  exit 0
fi

if [ "$assume_yes" -eq 0 ]; then
  read -r -p "Tag and push ${tag}, then build and upload both apps? [y/N] " answer
  case "$answer" in y | Y | yes) ;; *) echo "Cancelled."; exit 1 ;; esac
fi

git tag -a "$tag" -m "Mobile release ${version}"
git push origin "$tag"

echo "Waiting for the Mobile workflow to start..."
run_id=""
for _ in $(seq 1 30); do
  run_id="$(gh run list --workflow mobile.yml --branch "$tag" --event push --limit 1 --json databaseId --jq '.[0].databaseId // empty')"
  [ -n "$run_id" ] && break
  sleep 2
done
[ -n "$run_id" ] || die "The workflow didn't start. Check the Actions tab; the tag ${tag} was pushed."

echo "Following run ${run_id}"
if gh run watch "$run_id" --exit-status > /dev/null; then
  echo "Done. ${tag} is uploaded: it appears in TestFlight after Apple finishes processing (about 10-30 minutes) and on the Play internal track."
  echo "Promote it to the public stores with: pnpm mobile:promote"
else
  die "The release run failed: $(gh run view "$run_id" --json url --jq .url). Fix the cause and use 'Re-run failed jobs' there; the build number keeps rising."
fi
