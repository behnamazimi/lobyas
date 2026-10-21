#!/usr/bin/env bash
# Says which signing secret is missing or malformed, and whether the match repo can be
# cloned with them, without printing any secret. Runs before fastlane in Mobile signing.
set -uo pipefail

failed=0
fail() {
  echo "FAIL  $1"
  failed=1
}

for name in APPLE_TEAM_ID APP_STORE_CONNECT_KEY_ID APP_STORE_CONNECT_ISSUER_ID APP_STORE_CONNECT_KEY MATCH_GIT_URL MATCH_GIT_BASIC_AUTHORIZATION MATCH_PASSWORD; do
  value="${!name:-}"
  if [ -z "$value" ]; then
    fail "$name is empty or missing in the Mobile release environment"
  elif [ "$value" != "$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')" ]; then
    fail "$name starts or ends with a space or line break"
  else
    echo "ok    $name (${#value} characters)"
  fi
done

if [ -n "${MATCH_GIT_URL:-}" ]; then
  if [[ "$MATCH_GIT_URL" =~ ^https://github\.com/[^/]+/[^/]+$ ]]; then
    echo "ok    MATCH_GIT_URL is an https://github.com/<owner>/<repo> address"
  else
    fail "MATCH_GIT_URL must look like https://github.com/<owner>/<repo>.git (no ssh address, no /tree/ path)"
  fi
fi

if [ -n "${MATCH_GIT_BASIC_AUTHORIZATION:-}" ]; then
  decoded="$(printf '%s' "$MATCH_GIT_BASIC_AUTHORIZATION" | base64 --decode 2>/dev/null || true)"
  user="${decoded%%:*}"
  token="${decoded#*:}"
  if [[ "$decoded" != *:* || -z "$user" || -z "$token" ]]; then
    fail "MATCH_GIT_BASIC_AUTHORIZATION must be the base64 of <github user>:<token>"
  else
    echo "ok    MATCH_GIT_BASIC_AUTHORIZATION decodes to user '$user' and a token of ${#token} characters"
  fi
fi

if [ "$failed" -eq 0 ]; then
  if output="$(git -c "http.extraheader=Authorization: Basic ${MATCH_GIT_BASIC_AUTHORIZATION}" ls-remote "$MATCH_GIT_URL" 2>&1)"; then
    echo "ok    the match repo can be read"
  else
    fail "the match repo can't be read with these values (git said: ${output//$MATCH_GIT_URL/<url>})"
  fi
fi

exit "$failed"
