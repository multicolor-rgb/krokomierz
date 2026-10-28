#!/usr/bin/env bash
# Buduje stronę i aplikację PWA i publikuje je w katalogu serwowanym przez nginx.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export TMPDIR="${TMPDIR:-/home/multi/tmp}"

echo "▸ Budowanie aplikacji web (PWA, /app/)..."
cd "$ROOT/mobile"
npm run build

echo "▸ Budowanie strony..."
cd "$ROOT/landing"
npm run build

echo "▸ Publikacja..."
rm -rf "$ROOT/static" "$ROOT/screens" "$ROOT/icons" "$ROOT/app"
cp -r "$ROOT/landing/dist/." "$ROOT/"
mkdir -p "$ROOT/app"
cp -r "$ROOT/mobile/dist/." "$ROOT/app/"
mkdir -p "$ROOT/download"

# Uprawnienia tylko do odczytu dla serwera WWW.
find "$ROOT" -maxdepth 1 -type f -exec chmod 644 {} \;
find "$ROOT/static" "$ROOT/screens" "$ROOT/icons" "$ROOT/app" "$ROOT/download" -type f -exec chmod 644 {} \; 2>/dev/null || true

echo "✔ Strona: https://krokomierz.multidev.top/"
echo "✔ Aplikacja: https://krokomierz.multidev.top/app/"
echo "✔ APK: https://krokomierz.multidev.top/download/"
