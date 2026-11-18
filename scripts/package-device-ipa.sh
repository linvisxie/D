#!/bin/bash
set -euo pipefail

app=$1
output=$2
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
test -s "$app/main.jsbundle"
plist="$app/Info.plist"
[[ "$(plutil -extract CFBundleSupportedPlatforms.0 raw -o - "$plist")" = iPhoneOS ]]
[[ "$(plutil -extract CFBundleIdentifier raw -o - "$plist")" = com.linvisxie.d ]]
binary=$(plutil -extract CFBundleExecutable raw -o - "$plist")
lipo "$app/$binary" -verify_arch arm64
mkdir "$work/Payload"
ditto "$app" "$work/Payload/PocketPal.app"
(cd "$work" && /usr/bin/zip -qry -y unsigned.ipa Payload)
unzip -tq "$work/unsigned.ipa"
mv "$work/unsigned.ipa" "$output"
