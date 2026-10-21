#!/usr/bin/env bash
# Sends the values in .env.mobile to the "Mobile release" environment on GitHub as secrets.
# Needs the GitHub CLI, logged in with access to this repo (gh auth login).
# Checks the iOS values first and sends nothing if any of them is wrong.
set -euo pipefail

ENV_FILE="${1:-.env.mobile}"
ENVIRONMENT="Mobile release"

KNOWN_NAMES=" APPLE_TEAM_ID APP_STORE_CONNECT_KEY_ID APP_STORE_CONNECT_ISSUER_ID APP_STORE_CONNECT_KEY_FILE MATCH_GIT_URL MATCH_GIT_USER MATCH_GIT_TOKEN MATCH_PASSWORD ANDROID_KEYSTORE_FILE ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD PLAY_SERVICE_ACCOUNT_FILE "

die() {
  echo "Error: $*" >&2
  exit 1
}

for tool in gh git openssl base64; do
  command -v "$tool" > /dev/null || die "$tool is not installed."
done
gh auth status > /dev/null 2>&1 || die "Not logged in to GitHub. Run: gh auth login"
[ -f "$ENV_FILE" ] || die "Missing $ENV_FILE. Copy .env.mobile.example to $ENV_FILE and fill it in."

# Reads NAME=value lines as plain text, so spaces, quotes and $ in a value are kept as typed.
echo "Reading $ENV_FILE"
line_number=0
while IFS= read -r line || [ -n "$line" ]; do
  line_number=$((line_number + 1))
  line="${line%$'\r'}"
  case "$line" in '' | \#*) continue ;; esac
  case "$line" in *=*) ;; *) die "$ENV_FILE line $line_number: expected NAME=value" ;; esac

  name="$(printf '%s' "${line%%=*}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^export[[:space:]][[:space:]]*//')"
  value="$(printf '%s' "${line#*=}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  case "$value" in
    \"*\") value="${value#\"}"; value="${value%\"}" ;;
    \'*\') value="${value#\'}"; value="${value%\'}" ;;
  esac

  case "$KNOWN_NAMES" in
    *" $name "*) ;;
    *) echo "warn   $ENV_FILE line $line_number: '$name' isn't a name this script uses (ignored)"; continue ;;
  esac

  case "$name" in
    *_FILE) value="${value/#\~/$HOME}" ;;
  esac
  if [ -z "$value" ]; then
    echo "empty  $name"
  else
    echo "read   $name (${#value} characters)"
  fi
  export "$name=$value"
done < "$ENV_FILE"

# Accepts owner/repo, github.com/owner/repo, the ssh address or the full URL.
normalize_repo_url() {
  local url="$1"
  case "$url" in
    git@github.com:*) url="${url#git@github.com:}" ;;
  esac
  url="${url#https://}"
  url="${url#http://}"
  url="${url#github.com/}"
  url="${url%%/tree/*}"
  url="${url%/}"
  url="${url%.git}"
  case "$url" in
    */*/* | */ | /* | "") printf '%s' "$1" ;;
    *) printf 'https://github.com/%s.git' "$url" ;;
  esac
}

file_path_or_die() {
  local name="$1" path="${2:-}"
  [ -z "$path" ] && return 0
  [ -f "$path" ] || die "$name: no file at '$path'. Use the full path to the file."
}

file_contents() {
  [ -n "${1:-}" ] && cat "$1" || true
}

file_base64() {
  [ -n "${1:-}" ] && base64 < "$1" | tr -d '\n' || true
}

file_path_or_die APP_STORE_CONNECT_KEY_FILE "${APP_STORE_CONNECT_KEY_FILE:-}"
file_path_or_die ANDROID_KEYSTORE_FILE "${ANDROID_KEYSTORE_FILE:-}"
file_path_or_die PLAY_SERVICE_ACCOUNT_FILE "${PLAY_SERVICE_ACCOUNT_FILE:-}"

if [ -n "${APP_STORE_CONNECT_KEY_FILE:-}" ] && ! head -1 "$APP_STORE_CONNECT_KEY_FILE" | grep -q "BEGIN PRIVATE KEY"; then
  die "APP_STORE_CONNECT_KEY_FILE isn't the .p8 key: its first line should be -----BEGIN PRIVATE KEY-----"
fi

ios_values="${APPLE_TEAM_ID:-}${APP_STORE_CONNECT_KEY_ID:-}${APP_STORE_CONNECT_ISSUER_ID:-}${APP_STORE_CONNECT_KEY_FILE:-}${MATCH_GIT_URL:-}${MATCH_GIT_USER:-}${MATCH_GIT_TOKEN:-}${MATCH_PASSWORD:-}"
if [ -n "$ios_values" ]; then
  [ -n "${MATCH_GIT_USER:-}" ] || die "MATCH_GIT_USER is empty. It is the GitHub user that owns the token."
  [ -n "${MATCH_GIT_TOKEN:-}" ] || die "MATCH_GIT_TOKEN is empty."
  if [ -n "${MATCH_GIT_URL:-}" ]; then
    normalized="$(normalize_repo_url "$MATCH_GIT_URL")"
    if [ "$normalized" != "$MATCH_GIT_URL" ]; then
      echo "fixed  MATCH_GIT_URL: using $normalized"
    fi
    export MATCH_GIT_URL="$normalized"
  fi
  MATCH_GIT_BASIC_AUTHORIZATION="$(printf '%s:%s' "$MATCH_GIT_USER" "$MATCH_GIT_TOKEN" | base64 | tr -d '\n')"
  APP_STORE_CONNECT_KEY="$(file_base64 "${APP_STORE_CONNECT_KEY_FILE:-}")"
  export MATCH_GIT_BASIC_AUTHORIZATION APP_STORE_CONNECT_KEY

  echo
  echo "Checking the iOS values before sending anything..."
  "$(dirname "$0")/check-signing-secrets.sh" || die "Fix $ENV_FILE and run this again. Nothing was sent."
fi

set_secret() {
  local name="$1" value="$2"
  if [ -z "$value" ]; then
    echo "skip   $name (empty)"
    return
  fi
  # gh reads the value from the pipe. "--body -" would store a literal "-".
  printf '%s' "$value" | gh secret set "$name" --env "$ENVIRONMENT"
  echo "set    $name"
}

echo
echo "Sending to the '$ENVIRONMENT' environment..."
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

echo
echo "Secrets now in '$ENVIRONMENT':"
gh secret list --env "$ENVIRONMENT"
