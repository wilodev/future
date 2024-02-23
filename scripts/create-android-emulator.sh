#!/bin/sh

set -e
set -u
set -o pipefail

ANDROID_API_LEVEL="30"
if [[ $(uname -m) == 'arm64' ]]; then
  ANDROID_ARCH="arm64-v8a"
elif [[ $(uname -m) == 'x86_64' ]]; then
  ANDROID_ARCH="x86_64"
else
  echo "Error - Unsupported architecture"
  exit 1
fi

ANDROID_IMAGE_NAME="system-images;android-${ANDROID_API_LEVEL};google_apis;${ANDROID_ARCH}"
ANDROID_EMULATOR_NAME="emu"

yes | sdkmanager --install $ANDROID_IMAGE_NAME && echo "SDK Image installed successfully"

avdmanager --silent \
    create avd \
    --force \
    --name $ANDROID_EMULATOR_NAME \
    --device "pixel" \
    --package $ANDROID_IMAGE_NAME \
    --sdcard 1024M && echo "Emulator created successfully"


ANDROID_EMULATOR_CONFIG_PATH="${HOME}/.android/avd/${ANDROID_EMULATOR_NAME}.avd/config.ini"

set +e
grep -q -F 'hw.keyboard' $ANDROID_EMULATOR_CONFIG_PATH
keyboard_check_exit_code=$?
set -e

if [ $keyboard_check_exit_code -ne 0 ]; then
  echo "hw.keyboard=yes" >> $ANDROID_EMULATOR_CONFIG_PATH
fi
