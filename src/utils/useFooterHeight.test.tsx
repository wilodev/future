import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useFooterHeight, { FOOTER_CONTENT_HEIGHT, FOOTER_VERTICAL_PADDING } from './useFooterHeight';
import { SafeAreaProvider } from 'react-native-safe-area-context';

describe('useFooterHeight', () => {
  const render = (bottomInset: number) =>
    renderHook(() => useFooterHeight(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, height: 100, width: 100 },
            insets: { top: 0, bottom: bottomInset, left: 0, right: 0 },
          }}>
          {children}
        </SafeAreaProvider>
      ),
    });

  describe('when the bottom safe area inset is less than FOOTER_VERTICAL_PADDING', () => {
    it('returns the footer height based on FOOTER_VERTICAL_PADDING padding above and below the footer bar', () => {
      expect(render(3).result.current).toEqual(
        FOOTER_VERTICAL_PADDING + FOOTER_CONTENT_HEIGHT + FOOTER_VERTICAL_PADDING,
      );
    });
  });

  describe('when the bottom safe area inset is more than FOOTER_VERTICAL_PADDING', () => {
    it('returns the footer height based on FOOTER_VERTICAL_PADDING padding above and padding equal to the bottom inset below', () => {
      expect(render(40).result.current).toEqual(
        FOOTER_VERTICAL_PADDING + FOOTER_CONTENT_HEIGHT + 40,
      );
    });
  });
});
