#!/usr/bin/env bash
# Helpers for mobile-release.sh. Source it from the repo root; it only defines functions.

# Paths whose changes need a new store build. Keep in line with the pull_request paths in
# .github/workflows/mobile.yml.
NATIVE_PATHS=(capacitor.config.ts native ios android fastlane resources Gemfile Gemfile.lock)

last_release_tag() {
  git for-each-ref --sort=-v:refname --count=1 --format='%(refname:short)' 'refs/tags/mobile-v*'
}

# Native files that differ from the last release (all of them when there is no release yet).
native_changed_files() {
  local since="${1:-}"
  if [ -n "$since" ]; then
    git diff --name-only "$since" HEAD -- "${NATIVE_PATHS[@]}"
  else
    git ls-files -- "${NATIVE_PATHS[@]}"
  fi
}

# A Capacitor plugin added, removed or upgraded in package.json changes the native build too.
native_dependency_changes() {
  local since="${1:-}"
  [ -n "$since" ] || return 0
  git diff "$since" HEAD -- package.json | grep -E '^[+-][[:space:]]+"@(capacitor|capgo)/' || true
}

# next_version 1.2.3 minor -> 1.3.0
next_version() {
  local current="$1" bump="$2" major minor patch
  IFS=. read -r major minor patch <<< "$current"
  case "$bump" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "${major}.$((minor + 1)).0" ;;
    patch) echo "${major}.${minor}.$((patch + 1))" ;;
    *) return 1 ;;
  esac
}
