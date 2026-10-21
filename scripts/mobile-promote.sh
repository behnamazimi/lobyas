#!/usr/bin/env bash
# Sends the latest beta build to the public stores.
#
#   pnpm mobile:promote android|ios|both [--rollout 10] [--version X.Y.Z] [--yes]
#
# Android moves whatever release is on the Play internal track to production at the given
# percentage (default 10); the version doesn't apply to it. iOS submits the TestFlight build of
# --version (default: the latest mobile-v tag) for App Store review, with a phased release.
# The Mobile promote workflow does the work.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
# shellcheck source=scripts/mobile-lib.sh
. scripts/mobile-lib.sh

die() {
  echo "Error: $*" >&2
  exit 1
}

platform="${1:-}"
case "$platform" in android | ios | both) shift ;; *) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;; esac

rollout=10
version=""
assume_yes=0
while [ $# -gt 0 ]; do
  case "$1" in
    --rollout) rollout="${2:-}"; shift 2 ;;
    --version) version="${2:-}"; shift 2 ;;
    --yes) assume_yes=1; shift ;;
    *) die "Unknown option $1" ;;
  esac
done

[[ "$rollout" =~ ^[0-9]+$ ]] && [ "$rollout" -ge 1 ] && [ "$rollout" -le 100 ] || die "--rollout must be a whole number from 1 to 100."

command -v gh > /dev/null || die "gh is not installed."
gh auth status > /dev/null 2>&1 || die "Not logged in to GitHub. Run: gh auth login"

if [ -z "$version" ]; then
  git fetch --quiet origin --tags
  tag="$(last_release_tag)"
  [ -n "$tag" ] || die "There is no mobile-v tag yet. Release first with pnpm mobile:release."
  version="${tag#mobile-v}"
fi
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "'$version' is not a version like 1.2.3."

[ "$platform" = ios ] || echo "Android: the release now on the Play internal track goes to production at ${rollout}%."
[ "$platform" = android ] || echo "iOS: the TestFlight build of ${version} is submitted for App Store review."
if [ "$assume_yes" -eq 0 ]; then
  read -r -p "Continue? [y/N] " answer
  case "$answer" in y | Y | yes) ;; *) echo "Cancelled."; exit 1 ;; esac
fi

before="$(gh run list --workflow mobile-promote.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId // 0')"
gh workflow run mobile-promote.yml -f platform="$platform" -f version="$version" -f rollout="$rollout"

run_id=""
for _ in $(seq 1 30); do
  run_id="$(gh run list --workflow mobile-promote.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId // 0')"
  [ "$run_id" != "$before" ] && [ "$run_id" != 0 ] && break
  run_id=""
  sleep 2
done
[ -n "$run_id" ] || die "The workflow didn't start. Check the Actions tab."

echo "Following run ${run_id}"
if gh run watch "$run_id" --exit-status > /dev/null; then
  [ "$platform" = ios ] || echo "Done. Android is rolling out at ${rollout}% in Play Console."
  [ "$platform" = android ] || echo "Done. iOS shows 'Waiting for Review' in App Store Connect."
else
  die "The promote run failed: $(gh run view "$run_id" --json url --jq .url)"
fi
