fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios development_download_credentials

```sh
[bundle exec] fastlane ios development_download_credentials
```

Download profile and certs used for development

### ios development_regenerate_credentials

```sh
[bundle exec] fastlane ios development_regenerate_credentials
```

Regenerate profile and certs used for development

### ios beta_regenerate_credentials

```sh
[bundle exec] fastlane ios beta_regenerate_credentials
```

Regenerate profile and certs used for deploying Beta internal release

### ios beta_deploy

```sh
[bundle exec] fastlane ios beta_deploy
```

Deploy beta app

### ios dev_deploy

```sh
[bundle exec] fastlane ios dev_deploy
```

Deploy development app

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
