import { renderHook } from '@testing-library/react-hooks';
import { useSpacing, Spacing } from './useSpacing';
import useLargeDevice from '~/utils/useLargeDevice';

jest.mock('~/utils/useLargeDevice');

describe('useSpacing', () => {
  describe('when it is a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: true });
    });

    it('horizontalScreenPadding is set to Spacing medium', () => {
      const { horizontalScreenPadding } = renderHook(useSpacing).result.current;

      expect(horizontalScreenPadding).toBe(Spacing.medium);
    });
  });

  describe('when it is not a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });
    });

    it('horizontalScreenPadding is set to Spacing small', () => {
      const { horizontalScreenPadding } = renderHook(useSpacing).result.current;

      expect(horizontalScreenPadding).toBe(Spacing.small);
    });
  });
});
