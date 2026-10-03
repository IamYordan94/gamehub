#!/usr/bin/env bash
# Build the signed Android release (AAB for Play + APK for direct sharing).
# Java = Android Studio's JBR (Java 21). SDK path comes from android/local.properties.
# Keystore: ~/yodoku-release.keystore via android/keystore.properties (gitignored).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> cap sync (web assets + plugins)"
npx cap sync android

cd android
export JAVA_HOME="${JAVA_HOME:-/c/Program Files/Android/Android Studio/jbr}"
sh ./gradlew bundleRelease assembleRelease

echo
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
