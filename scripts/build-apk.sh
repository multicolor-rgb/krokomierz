#!/usr/bin/env bash
# Buduje podpisany APK i AAB, kopiuje artefakty do download/ i generuje version.json.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/mobile"
VERSION="$(node -p "require('$APP/package.json').version")"
VERSION_CODE="$(grep -oP 'versionCode \K[0-9]+' "$APP/android/app/build.gradle" | head -1)"
OUT="$ROOT/download"

export JAVA_HOME="${JAVA_HOME:-/home/multi/opt/jdk}"
export ANDROID_HOME="${ANDROID_HOME:-/home/multi/opt/android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$PATH"
export TMPDIR="${TMPDIR:-/home/multi/tmp}"
export JAVA_TOOL_OPTIONS="-Djava.io.tmpdir=$TMPDIR -XX:-UsePerfData"
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-/home/multi/.gradle}"

echo "▸ Budowanie aplikacji web (native)..."
cd "$APP"
npm run build:native
npx cap sync android

echo "▸ Budowanie APK i AAB..."
cd "$APP/android"
./gradlew assembleRelease bundleRelease --no-daemon --max-workers=1

mkdir -p "$OUT"
APK_SRC="$APP/android/app/build/outputs/apk/release/app-release.apk"
AAB_SRC="$APP/android/app/build/outputs/bundle/release/app-release.aab"
APK="$OUT/krokomierz-$VERSION.apk"
AAB="$OUT/krokomierz-$VERSION.aab"
LATEST_APK="$OUT/krokomierz-latest.apk"
LATEST_AAB="$OUT/krokomierz-latest.aab"

cp "$APK_SRC" "$APK"
cp "$AAB_SRC" "$AAB"
cp "$APK" "$LATEST_APK"
cp "$AAB" "$LATEST_AAB"

SHA="$(sha256sum "$APK" | awk '{print $1}')"
SIZE="$(stat -c%s "$APK")"
printf '%s  %s\n' "$SHA" "krokomierz-$VERSION.apk" > "$OUT/krokomierz-$VERSION.apk.sha256"
printf '%s  %s\n' "$SHA" "krokomierz-latest.apk" > "$OUT/krokomierz-latest.apk.sha256"

cat > "$OUT/version.json" <<JSON
{
  "version": "$VERSION",
  "versionCode": $VERSION_CODE,
  "url": "https://github.com/multicolor-rgb/krokomierz/releases/latest/download/krokomierz-latest.apk",
  "size": $SIZE,
  "sha256": "$SHA",
  "date": "$(date -u +%Y-%m-%d)",
  "notes": {
    "pl": "Tryb cichy, fallback akcelerometra dla Redmi 7, diagnostyka sensora, długość kroku i czułość.",
    "en": "Silent mode, accelerometer fallback for Redmi 7, sensor diagnostics, stride length and sensitivity."
  }
}
JSON

echo "✔ APK: $APK ($(du -h "$APK" | cut -f1))"
echo "✔ AAB: $AAB"
echo "✔ SHA-256: $SHA"
