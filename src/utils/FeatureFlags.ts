import Config, { NativeConfig } from 'react-native-config';

const FeatureFlagDefaults = {
  MARK_AS_COMPLETE: true,
} as const;

const parseBoolean = (value?: string) => {
  if (!value) {
    return;
  }

  switch (value.trim().toLowerCase()) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      throw Error(`Invalid feature flag value '${value}'`);
  }
};

export const calculateFeatureFlags = <K extends string>(
  config: NativeConfig,
  defaults: Record<K, boolean>,
) => {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, defaultValue]) => [
      key,
      parseBoolean(config[`FEATURE_${key}`]) ?? defaultValue,
    ]),
  ) as Record<K, boolean>;
};

export default calculateFeatureFlags(Config, FeatureFlagDefaults);
