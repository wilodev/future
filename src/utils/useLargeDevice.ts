import { useWindowDimensions } from 'react-native';

export const LARGE_DEVICE_CONTAINER_WIDTH = 560;

export default function useLargeDevice() {
  const { width, height } = useWindowDimensions();

  const isLargeDevice = width >= LARGE_DEVICE_CONTAINER_WIDTH;

  return { isLargeDevice, height };
}
