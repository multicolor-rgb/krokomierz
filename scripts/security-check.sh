#!/usr/bin/env bash
# Sprawdza, czy źródła i .git nie są publicznie dostępne oraz czy publiczne ścieżki działają.
set -euo pipefail

BASE="${1:-https://krokomierz.multidev.top}"
FAIL=0

check_blocked() {
  local path="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [ "$code" = "403" ] || [ "$code" = "404" ]; then
    echo "OK   $path -> $code"
  else
    echo "FAIL $path -> $code (oczekiwano 403/404)"
    FAIL=1
  fi
}

check_public() {
  local path="$1"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$BASE$path")"
  if [ "$code" = "200" ]; then
    echo "OK   $path -> 200"
  else
    echo "FAIL $path -> $code (oczekiwano 200)"
    FAIL=1
  fi
}

check_blocked "/.git"
check_blocked "/.git/config"
check_blocked "/mobile/package.json"
check_blocked "/landing/src/App.tsx"
check_blocked "/scripts/deploy.sh"
check_blocked "/.github/workflows/android.yml"

check_public "/"
check_public "/app/"
check_public "/download/version.json"

exit "$FAIL"
