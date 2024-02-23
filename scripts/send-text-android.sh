#!/bin/sh

input="$(sed 's/ /%s/g' <<< $1)";
adb shell input text "${input}";
