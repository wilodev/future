import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const FOOTER_VERTICAL_PADDING = 14;
export const FOOTER_CONTENT_HEIGHT = 32;

export default function useFooterHeight(): number {
  const { bottom } = useSafeAreaInsets();

  const topPadding = FOOTER_VERTICAL_PADDING;
  const bottomPadding = Math.max(bottom, FOOTER_VERTICAL_PADDING);

  return topPadding + FOOTER_CONTENT_HEIGHT + bottomPadding;
}
