#!/usr/bin/env bash
# Says which signing secret is missing or malformed, and whether the match repo can be
# cloned with them, without printing any secret. Runs before fastlane in Mobile signing,
# and before set-mobile-secrets.sh sends anything. Works with the bash and tools macOS ships.
set -uo pipefail

failed=0
fail() {
  echo "FAIL  $1"
  failed=1
}

trim() {
  printf '%s' "$1" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//'
}

for name in APPLE_TEAM_ID APP_STORE_CONNECT_KEY_ID APP_STORE_CONNECT_ISSUER_ID APP_STORE_CONNECT_KEY MATCH_GIT_URL MATCH_GIT_BASIC_AUTHORIZATION MATCH_PASSWORD; do
  value="${!name:-}"
  if [ -z "$value" ]; then
    fail "$name is empty or missing"
  elif [ "$value" != "$(trim "$value")" ]; then
    fail "$name starts or ends with a space or line break"
  else
    echo "ok    $name (${#value} characters)"
  fi
done

repo_pattern='^https://github\.com/[^/]+/[^/]+$'
if [ -n "${MATCH_GIT_URL:-}" ]; then
  if [[ "$MATCH_GIT_URL" =~ $repo_pattern ]]; then
    echo "ok    MATCH_GIT_URL is $MATCH_GIT_URL"
  else
    fail "MATCH_GIT_URL is '$MATCH_GIT_URL' but must look like https://github.com/<owner>/<repo>.git"
  fi
fi

if [ -n "${MATCH_GIT_BASIC_AUTHORIZATION:-}" ]; then
  decoded="$(printf '%s' "$MATCH_GIT_BASIC_AUTHORIZATION" | openssl base64 -d -A 2>/dev/null || true)"
  user="${decoded%%:*}"
  token="${decoded#*:}"
  if [ -z "$decoded" ]; then
    fail "MATCH_GIT_BASIC_AUTHORIZATION isn't valid base64"
  elif [[ "$decoded" != *:* ]]; then
    fail "MATCH_GIT_BASIC_AUTHORIZATION decodes to text without a ':' between the user and the token"
  elif [ -z "$user" ] || [ -z "$token" ]; then
    fail "MATCH_GIT_BASIC_AUTHORIZATION has an empty user or an empty token"
  else
    echo "ok    MATCH_GIT_BASIC_AUTHORIZATION decodes to user '$user' and a token of ${#token} characters"
  fi
fi

if [ "$failed" -eq 0 ]; then
  # Only the given header may authenticate: no stored keychain login, no prompt.
  if output="$(GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c "http.extraheader=Authorization: Basic ${MATCH_GIT_BASIC_AUTHORIZATION}" ls-remote "$MATCH_GIT_URL" 2>&1)"; then
    echo "ok    the match repo can be read"
  else
    fail "the match repo can't be read with these values (git said: ${output//$MATCH_GIT_URL/<url>})"
    case "$output" in
      *"not found"* | *"could not read Username"* | *"Authentication failed"* | *"does not exist"*)
        echo "      GitHub refused the login. Check that the token has not expired, that it has Contents: Read and write on this one repo, that the user is the token's owner, and that the repo exists under that owner." ;;
    esac
  fi
fi

exit "$failed"
