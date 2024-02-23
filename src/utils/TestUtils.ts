import { Platform } from 'react-native';
import { act } from 'react-test-renderer';
import { afterAll, beforeAll } from '@jest/globals';
import { NavigationProp } from '@react-navigation/native';

export async function withOS(os: typeof Platform.OS) {
  let originalPlatform: typeof Platform.OS;

  beforeAll(() => {
    originalPlatform = Platform.OS;
    Platform.OS = os;
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });
}

export const waitForPromises = () => act(() => new Promise<void>(resolve => setImmediate(resolve)));

export const setupMockNavigationProp = <T extends NavigationProp<any>>() => {
  let blurCallbacks = new Set<Function>();
  let focusCallbacks = new Set<Function>();

  let isFocused = true;

  const blur = () => {
    isFocused = false;
    blurCallbacks.forEach(callback => callback());
  };

  const focus = () => {
    isFocused = true;
    focusCallbacks.forEach(callback => callback());
  };

  const navigationProp = {
    addListener(type, callback) {
      switch (type) {
        case 'blur':
          blurCallbacks.add(callback);
          return () => {
            blurCallbacks.delete(callback);
          };
        case 'focus':
          focusCallbacks.add(callback);
          return () => {
            focusCallbacks.delete(callback);
          };
        default:
          return () => {};
      }
    },
    isFocused: () => isFocused,
    navigate: jest.fn() as T['navigate'],
    setOptions: jest.fn() as T['setOptions'],
    setParams: jest.fn() as T['setParams'],
  } as Partial<T> as T;

  return { blur, focus, navigationProp };
};
