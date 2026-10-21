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

# Read KEY=VALUE lines as plain text, so spaces, quotes and $ in a value are kept as typed.
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  case "$line" in '' | \#*) continue ;; esac
  key="${line%%=*}"
  value="${line#*=}"
  value="$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  case "$value" in
    \"*\") value="${value#\"}"; value="${value%\"}" ;;
    \'*\') value="${value#\'}"; value="${value%\'}" ;;
  esac
  export "$key=$value"
done < "$ENV_FILE"

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

if [ -n "${MATCH_GIT_URL:-}" ]; then
  if [ -z "${MATCH_GIT_USER:-}" ] || [ -z "${MATCH_GIT_TOKEN:-}" ]; then
    echo "MATCH_GIT_USER and MATCH_GIT_TOKEN are both needed when MATCH_GIT_URL is set." >&2
    exit 1
  fi
  MATCH_GIT_BASIC_AUTHORIZATION="$(printf '%s:%s' "$MATCH_GIT_USER" "$MATCH_GIT_TOKEN" | base64 | tr -d '\n')"
  APP_STORE_CONNECT_KEY="$(file_base64 "${APP_STORE_CONNECT_KEY_FILE:-}")"
  export MATCH_GIT_BASIC_AUTHORIZATION APP_STORE_CONNECT_KEY
  echo "Checking the iOS values before sending them..."
  "$(dirname "$0")/check-signing-secrets.sh" || {
    echo "Fix .env.mobile and run this again. Nothing was sent." >&2
    exit 1
  }
fi

# Create the environment if it doesn't exist yet.
gh api --method PUT "repos/{owner}/{repo}/environments/${ENVIRONMENT// /%20}" > /dev/null

set_secret APPLE_TEAM_ID "${APPLE_TEAM_ID:-}"
set_secret APP_STORE_CONNECT_KEY_ID "${APP_STORE_CONNECT_KEY_ID:-}"
set_secret APP_STORE_CONNECT_ISSUER_ID "${APP_STORE_CONNECT_ISSUER_ID:-}"
set_secret APP_STORE_CONNECT_KEY "${APP_STORE_CONNECT_KEY:-}"
set_secret MATCH_GIT_URL "${MATCH_GIT_URL:-}"
set_secret MATCH_GIT_BASIC_AUTHORIZATION "${MATCH_GIT_BASIC_AUTHORIZATION:-}"
set_secret MATCH_PASSWORD "${MATCH_PASSWORD:-}"

set_secret ANDROID_KEYSTORE_BASE64 "$(file_base64 "${ANDROID_KEYSTORE_FILE:-}")"
set_secret ANDROID_KEYSTORE_PASSWORD "${ANDROID_KEYSTORE_PASSWORD:-}"
set_secret ANDROID_KEY_ALIAS "${ANDROID_KEY_ALIAS:-}"
set_secret ANDROID_KEY_PASSWORD "${ANDROID_KEY_PASSWORD:-}"
set_secret PLAY_SERVICE_ACCOUNT_JSON "$(file_contents "${PLAY_SERVICE_ACCOUNT_FILE:-}")"
