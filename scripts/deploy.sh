#!/usr/bin/env bash
# Buduje stronę i aplikację PWA i publikuje je w katalogu serwowanym przez nginx.
# GitHub Pages jest docelowym hostingiem — ten skrypt zostaje jako fallback.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export TMPDIR="${TMPDIR:-/home/multi/tmp}"
export VITE_BASE="/"

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

# Kod źródłowy i historia git nie mogą być serwowane przez nginx.
if [ -f "$ROOT/.git" ]; then chmod 600 "$ROOT/.git"; else chmod 700 "$ROOT/.git" 2>/dev/null || true; fi
chmod 700 "$ROOT/.github" "$ROOT/mobile" "$ROOT/landing" "$ROOT/scripts" "$ROOT/assets" 2>/dev/null || true

echo "✔ Strona: https://krokomierz.multidev.top/"
echo "✔ Aplikacja: https://krokomierz.multidev.top/app/"
echo "✔ APK: https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk"
