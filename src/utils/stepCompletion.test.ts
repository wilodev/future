import { showMarkAsComplete } from './stepCompletion';
import FeatureFlags from '~/utils/FeatureFlags';

describe('showMarkAsComplete', () => {
  describe('when the feature flag is enabled', () => {
    beforeEach(() => {
      FeatureFlags.MARK_AS_COMPLETE = true;
    });

    it('returns false when the contentType is not supported', () => {
      expect(showMarkAsComplete('Quiz')).toBe(false);
    });

    it('returns true when the contentType is supported', () => {
      expect(showMarkAsComplete('Article')).toBe(true);
    });
  });

  describe('when the feature flag is not enabled', () => {
    beforeEach(() => {
      FeatureFlags.MARK_AS_COMPLETE = false;
    });

    it('returns false even if the contentType is supported', () => {
      expect(showMarkAsComplete('Article')).toBe(false);
    });
  });
});
