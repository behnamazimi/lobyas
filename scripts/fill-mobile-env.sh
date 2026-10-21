#!/usr/bin/env bash
# Fills the file paths and the Android alias in .env.mobile from a folder of key files
# (default: ./secrets) and asks for the keystore password. Run it, then run
# scripts/set-mobile-secrets.sh. It only changes the lines it fills; everything else in
# .env.mobile is kept.
#
#   scripts/fill-mobile-env.sh [secrets-folder]
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
SECRETS_DIR="${1:-secrets}"
ENV_FILE=".env.mobile"

die() {
  echo "Error: $*" >&2
  exit 1
}

[ -d "$SECRETS_DIR" ] || die "No folder '$SECRETS_DIR' here."
[ -f "$ENV_FILE" ] || cp .env.mobile.example "$ENV_FILE"

if ! git check-ignore -q "$SECRETS_DIR/x"; then
  echo "WARNING: '$SECRETS_DIR/' is not git-ignored, so 'git add .' would commit your keys."
  echo "         Fix it with: echo '$SECRETS_DIR/' >> .gitignore"
  echo
fi

absolute() {
  printf '%s/%s' "$(cd "$(dirname "$1")" && pwd)" "$(basename "$1")"
}

# set_var NAME VALUE: replaces the NAME= line, or adds it. The value is passed through the
# environment so passwords with / & \ are kept as typed.
set_var() {
  NAME="$1" VALUE="$2" awk '
    BEGIN { n = ENVIRON["NAME"]; v = ENVIRON["VALUE"] }
    index($0, n "=") == 1 { print n "=" v; found = 1; next }
    { print }
    END { if (!found) print n "=" v }
  ' "$ENV_FILE" > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
}

get_var() {
  grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2- || true
}

# find_one LABEL PATTERN...: exactly one file in the folder matching one of the patterns.
find_one() {
  local label="$1" found="" count=0 file pattern
  shift
  for pattern in "$@"; do
    for file in "$SECRETS_DIR"/$pattern; do
      [ -f "$file" ] || continue
      found="$file"
      count=$((count + 1))
    done
  done
  if [ "$count" -eq 0 ]; then
    echo "skip   $label: no file matching $* in $SECRETS_DIR"
    return 1
  fi
  if [ "$count" -gt 1 ]; then
    echo "skip   $label: $count files match $* in $SECRETS_DIR; keep only one"
    return 1
  fi
  printf '%s' "$found"
}

echo "Reading $SECRETS_DIR/"

if key_file="$(find_one "App Store Connect key" 'AuthKey_*.p8')"; then
  key_id="$(basename "$key_file" .p8)"
  key_id="${key_id#AuthKey_}"
  set_var APP_STORE_CONNECT_KEY_FILE "$(absolute "$key_file")"
  set_var APP_STORE_CONNECT_KEY_ID "$key_id"
  echo "fill   APP_STORE_CONNECT_KEY_FILE and APP_STORE_CONNECT_KEY_ID ($key_id)"
fi

service_account=""
for file in "$SECRETS_DIR"/*.json; do
  [ -f "$file" ] || continue
  if grep -q '"type"[[:space:]]*:[[:space:]]*"service_account"' "$file"; then
    [ -z "$service_account" ] || die "More than one service account JSON in $SECRETS_DIR; keep only the Play one."
    service_account="$file"
  fi
done
if [ -n "$service_account" ]; then
  set_var PLAY_SERVICE_ACCOUNT_FILE "$(absolute "$service_account")"
  echo "fill   PLAY_SERVICE_ACCOUNT_FILE"
else
  echo "skip   Play service account: no service account .json in $SECRETS_DIR"
fi

if keystore="$(find_one "Android keystore" '*.keystore' '*.jks')"; then
  set_var ANDROID_KEYSTORE_FILE "$(absolute "$keystore")"
  echo "fill   ANDROID_KEYSTORE_FILE"

  password="$(get_var ANDROID_KEYSTORE_PASSWORD)"
  alias_name="$(get_var ANDROID_KEY_ALIAS)"
  if command -v keytool > /dev/null; then
    while true; do
      if [ -z "$password" ]; then
        read -r -s -p "Keystore password (the one you typed in keytool): " password
        echo
      fi
      if listing="$(keytool -list -keystore "$keystore" -storepass "$password" 2> /dev/null)"; then
        break
      fi
      echo "That password doesn't open the keystore. Try again."
      password=""
    done
    found_alias="$(printf '%s\n' "$listing" | grep PrivateKeyEntry | sed -n 1p | cut -d, -f1)"
    [ -z "$found_alias" ] || alias_name="$found_alias"
  else
    echo "keytool isn't installed, so the password and alias can't be checked."
    [ -n "$password" ] || { read -r -s -p "Keystore password: " password; echo; }
    [ -n "$alias_name" ] || read -r -p "Key alias [lobyas-upload]: " alias_name
    alias_name="${alias_name:-lobyas-upload}"
  fi

  set_var ANDROID_KEYSTORE_PASSWORD "$password"
  set_var ANDROID_KEY_PASSWORD "$password"
  set_var ANDROID_KEY_ALIAS "$alias_name"
  echo "fill   ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_PASSWORD and ANDROID_KEY_ALIAS ($alias_name)"
fi

echo
echo "Still empty in $ENV_FILE:"
empty=0
for name in APPLE_TEAM_ID APP_STORE_CONNECT_KEY_ID APP_STORE_CONNECT_ISSUER_ID APP_STORE_CONNECT_KEY_FILE MATCH_GIT_URL MATCH_GIT_USER MATCH_GIT_TOKEN MATCH_PASSWORD ANDROID_KEYSTORE_FILE ANDROID_KEYSTORE_PASSWORD ANDROID_KEY_ALIAS ANDROID_KEY_PASSWORD PLAY_SERVICE_ACCOUNT_FILE; do
  if [ -z "$(get_var "$name")" ]; then
    echo "  $name"
    empty=1
  fi
done
[ "$empty" -eq 1 ] || echo "  nothing"
echo
echo "Next: scripts/set-mobile-secrets.sh"
