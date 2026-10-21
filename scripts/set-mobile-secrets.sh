#!/usr/bin/env bash
# Sends the values in .env.mobile to the "Mobile release" environment on GitHub as secrets.
# Needs the GitHub CLI, logged in with access to this repo (gh auth login).
set -euo pipefail

ENV_FILE="${1:-.env.mobile}"
ENVIRONMENT="Mobile release"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy .env.mobile.example to $ENV_FILE and fill it in." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

# Create the environment if it doesn't exist yet.
gh api --method PUT "repos/{owner}/{repo}/environments/${ENVIRONMENT// /%20}" > /dev/null

set_secret() {
  local name="$1" value="$2"
  if [ -z "$value" ]; then
    echo "skip   $name (empty)"
    return
  fi
  printf '%s' "$value" | gh secret set "$name" --env "$ENVIRONMENT" --body -
  echo "set    $name"
}

file_contents() {
  [ -n "$1" ] && cat "$1" || true
}

file_base64() {
  [ -n "$1" ] && base64 < "$1" | tr -d '\n' || true
}

set_secret APPLE_TEAM_ID "${APPLE_TEAM_ID:-}"
set_secret APP_STORE_CONNECT_KEY_ID "${APP_STORE_CONNECT_KEY_ID:-}"
set_secret APP_STORE_CONNECT_ISSUER_ID "${APP_STORE_CONNECT_ISSUER_ID:-}"
set_secret APP_STORE_CONNECT_KEY "$(file_contents "${APP_STORE_CONNECT_KEY_FILE:-}")"
set_secret MATCH_GIT_URL "${MATCH_GIT_URL:-}"
if [ -n "${MATCH_GIT_USER:-}" ] && [ -n "${MATCH_GIT_TOKEN:-}" ]; then
  set_secret MATCH_GIT_BASIC_AUTHORIZATION "$(printf '%s:%s' "$MATCH_GIT_USER" "$MATCH_GIT_TOKEN" | base64 | tr -d '\n')"
fi
set_secret MATCH_PASSWORD "${MATCH_PASSWORD:-}"

set_secret ANDROID_KEYSTORE_BASE64 "$(file_base64 "${ANDROID_KEYSTORE_FILE:-}")"
set_secret ANDROID_KEYSTORE_PASSWORD "${ANDROID_KEYSTORE_PASSWORD:-}"
set_secret ANDROID_KEY_ALIAS "${ANDROID_KEY_ALIAS:-}"
set_secret ANDROID_KEY_PASSWORD "${ANDROID_KEY_PASSWORD:-}"
set_secret PLAY_SERVICE_ACCOUNT_JSON "$(file_contents "${PLAY_SERVICE_ACCOUNT_FILE:-}")"
