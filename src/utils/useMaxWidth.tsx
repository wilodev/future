import { useWindowDimensions, Platform } from 'react-native';
import { useApp } from '~/hooks/AppProvider';

export function useMaxWidth(numColumns: number): number | string {
  const { width } = useWindowDimensions();
  const plataforma = Platform.OS.toLowerCase();
  if (plataforma === 'android') {
    if (width === 600) {
      return 300;
    } else if (width > 600) {
      return 341;
    }
  }
  return `${100 / numColumns}%`;
}

export function useMaxViewWidth() {
  const { width } = useWindowDimensions();
  const { widthFullScreenCarousel } = useApp();
  let windowWidth = width;
  const plataforma = Platform.OS.toLowerCase();
  if (plataforma === 'android') {
    if (width >= 600) {
      //windowWidth = width > height ? width : height + width * 0.1;
      windowWidth = widthFullScreenCarousel;
    }
  }
  return windowWidth;
}
