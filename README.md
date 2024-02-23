# FutureLearn mobile app

## Getting started

### Prerequisites

These instructions assume that you've already used to the
[developer-setup](https://github.com/Futurelearn/developer-setup) repo to install:

- [chruby](https://github.com/postmodern/chruby) and
  [ruby-install](https://github.com/postmodern/ruby-install) for managing ruby versions
- The correct version of Ruby (2.6.10) `chruby ruby-2.6.10`
- The correct version of Node (20.5.0)
- [nvm](https://github.com/creationix/nvm) for managing node versions
- [Yarn 1](https://classic.yarnpkg.com/) for installing node packages
- [Pre-commit](https://pre-commit.com/) for configuring pre-commit hooks

### Setting up linting pre-commit hooks

1.  Set up the pre-commit hooks for this repo:

        pre-commit install

### Setting environment variables

1.  Create your `.env` file from the template:

        cp .env.example .env

### Installing React Native pre-requisites

1.  React Native server requires [Watchman](https://facebook.github.io/watchman/) to determine which
    files have changed:

        brew install watchman

### Setting up the Android dev environment

1.  Ensure that you have the [Zulu11](https://www.azul.com/downloads/?package=jdk#zulu) installed

        brew tap homebrew/cask-versions
        brew install --cask zulu11

2.  Install [Android Studio](https://developer.android.com/studio)

        brew install android-studio

3.  Add required environment variables (refer to the
    [React Native setup guide](https://reactnative.dev/docs/environment-setup) for more details)

        export JAVA_HOME=$(/usr/libexec/java_home -v 11)

        export ANDROID_HOME=$HOME/Library/Android/sdk
        export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
        export PATH=$PATH:$ANDROID_HOME/emulator
        export PATH=$PATH:$ANDROID_HOME/tools
        export PATH=$PATH:$ANDROID_HOME/tools/bin
        export PATH=$PATH:$ANDROID_HOME/platform-tools

    for Android Studio versions before Giraffe (2022.3.1):

        export JAVA_HOME="/Applications/Android Studio.app/Contents/jre/jdk/Contents/Home"

4.  Open Android Studio

5.  Using the SDK Manager install:

    - Android 13 (R) SDK (API Level 33)
    - Android SDK Command-Line Tools (30.0.0)
    - Android SDK Build-Tools
    - Android SDK Platform-Tools
    - Android Emulator

6.  Create the Android emulator that'll be used to run our Detox tests

        yarn android:emulator:create

### Setting up the iOS dev environment

1.  Ensure you have a recent version of Ruby available globally. You should be able to use a package
    manager such as [chruby](https://github.com/postmodern/chruby) as long as Ruby is loaded in
    `.zshrc/.bashrc`.

2.  Install Xcode [from the Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

3.  Ensure that your machine is configured to use the full version of Xcode by default (as opposed
    to just the command-line tools as these aren't sufficient for React Native):

        sudo xcode-select --switch /Applications/Xcode.app

### Installing dependencies

1.  Install all node dependencies:

        yarn install

2.  Install Ruby gems:

        cd ios
        bundle install

3.  Install iOS dependencies:

        npx pod-install ios

## Running the app

1.  Start the React Native Metro server and the GraphQL code generator:

        yarn dev

    (Alternatively, start the two processes in separate terminals using `yarn start` and
    `yarn codegen:watch`)

2.  To run the app on the default iOS simulator:

        yarn ios

    See also: [Running the app on a physical iOS device](#running-the-app-on-a-physical-ios-device)

3.  To run the app on the Android emulator (or any other Android device connected to the Android
    Debug Bridge):

        yarn android
        yarn android:adb_reverse # only required when running against localhost

## Testing

### Running Jest unit test locally

    yarn jest

### Running Detox end-to-end test locally on Android

1.  Ensure that you've created the emulator (see
    [setting up the Android dev environment](#setting-up-the-android-dev-environment))

2.  Start emulator if it isn't already running:

        yarn android:emulator:boot
        yarn android:adb_reverse

3.  Start the React Native Metro server:

        yarn start

4.  Run the Detox build:

        yarn detox:android:debug:build

5.  Run the tests:

        yarn detox:android:debug:run

    After making changes to the app, you can usually rerun the tests without repeating the Detox
    build step

### Running Detox end-to-end test locally on iOS

1.  Install
    [applesimutils](https://github.com/wix/Detox/blob/master/docs/Introduction.iOSDevEnv.md#install-applesimutils):

        brew tap wix/brew
        brew install applesimutils

2.  Ensure that you have the iOS 15.2 Simulators installed:

    1. Open Xcode

    2. From the Xcode menu, select Preferences > Components > Simulators

    3. Click the Download icon next to 'iOS 15.2 Simulator'

3.  Ensure that Pods are in sync:

        npx pod-install ios

4.  Run the Detox build:

        yarn detox:ios:debug:build

5.  Run the tests:

        yarn detox:ios:debug:run

    After making changes to the app, you can usually rerun the tests without repeating the Detox
    build step

## Working with physical iOS devices

### Installing the iOS development profile

1.  Have the `MATCH_PASSWORD` from the _Mobile App_ vault in 1Password ready

2.  Download the development profile (you'll be prompted for the `MATCH_PASSWORD`)

        cd ios
        bundle install
        bundle exec fastlane development_download_credentials

### Registering an iOS device for testing

1.  Find the UDID of the device:

        xcrun xctrace list devices

2.  [Register the device](https://developer.apple.com/account/resources/devices/add) with our Apple
    Developer account

3.  Ask someone with the Admin role for our Apple Developer account to
    [regenerate the development profile](#regenerating-the-ios-development-profile)

4.  [Install the new development profile](#installing-the-ios-development-profile)

### Regenerating the iOS development profile

We may need to regenerate our development profile from time to time, for example after we have
registered a new test device. **You'll need someone with the Admin role in our Apple Developer
account to complete this operation**.

1.  Have the _MATCH_PASSWORD_ from the _Mobile App_ vault in 1Password ready

2.  Have your Apple ID credentials (one with the Admin role in our Apple Developer account) ready

3.  Nuke and regenerate the development profile:

        cd ios
        bundle exec fastlane development_regenerate_credentials

### Running the app on a physical iOS device

1.  Ensure that you have
    [installed the iOS development profile](#installing-the-ios-development-profile)

2.  Ensure the the device has been [registered for testing](#registering-an-iOS-device-for-testing)

3.  Install the `ios-deploy` tool:

        brew install ios-deploy

4.  Update your `.env` to use your current IP instead of localhost (e.g.
    `GRAPHQL_API_URL=http://192.164.0.23:3000/graphql`) and run the Rails server using
    `bin/rails s -b 0.0.0.0` to listen on all network interfaces.

5.  Run the app:

        yarn ios --device

## Creating and installing Android release packages locally

1.  Build the release package:

        cd android
        ./gradlew assembleRelease

    If you see 'Unable to extract native debug metadata from...' errors in the build output, you may
    need to install the version of the Android NDK specified in `android/build.gradle` before trying
    again.

2.  Ensure that you have a device connected to the Android Debug Bridge

3.  Install the release package on the device:

        adb -d install app/build/outputs/apk/beta/release/app-beta-release.apk

## Creating and installing iOS release app locally

1.  Build the release app:

        yarn ios --device --configuration Release

This will build and install the iOS (release build) on your iOS device

## Adding a new GraphQL query

1.  Add the query to a `gql` file (e.g. `src/screens/SignInScreen/UserAuthenticateMutation.gql`)

2.  If you're already running the GraphQL code generator watcher via `yarn dev` or
    `yarn codegen:watch`, this will detect the new file and automatically generate a TypeScript file
    defining the associated React hooks (e.g. `UserAuthenticateMutation.generated.tsx`).

    If you are not the GraphQL code generator watcher you will need to run the code generator
    manually:

        yarn codegen:main
