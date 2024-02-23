import { calculateFeatureFlags } from './FeatureFlags';

describe('calculateFeatureFlags', () => {
  it('returns the default value when no matching entry exists in the config', () => {
    expect(calculateFeatureFlags({ FEATURE_GAMMA: 'true' }, { ALPHA: true, BETA: false })).toEqual({
      ALPHA: true,
      BETA: false,
    });
  });

  it('returns the feature flag values from the config, when present', () => {
    expect(
      calculateFeatureFlags(
        { FEATURE_ALPHA: 'false', FEATURE_BETA: 'true' },
        { ALPHA: true, BETA: false },
      ),
    ).toEqual({ ALPHA: false, BETA: true });
  });

  it('ignores casing in the config values', () => {
    expect(calculateFeatureFlags({ FEATURE_ALPHA: 'TruE' }, { ALPHA: false })).toEqual({
      ALPHA: true,
    });
  });

  it('allows whitespace before and after the config values', () => {
    expect(calculateFeatureFlags({ FEATURE_ALPHA: ' true ' }, { ALPHA: false })).toEqual({
      ALPHA: true,
    });
  });

  it('raises an error if the config contains an invalid feature flag value', () => {
    expect(() => calculateFeatureFlags({ FEATURE_ALPHA: 'strangeValue' }, { ALPHA: true })).toThrow(
      "Invalid feature flag value 'strangeValue'",
    );
  });
});
