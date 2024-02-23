import useFadeOutAnimation from './useFadeOutAnimation';
import { renderHook } from '@testing-library/react-hooks';
import { Animated } from 'react-native';

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.useFakeTimers();

describe('useFadeOutAnimation', () => {
  const setup = (isVisible: boolean | undefined) => {
    const animatedTimingSpy = jest.spyOn(Animated, 'timing');
    renderHook(() => useFadeOutAnimation({ isVisible }));
    return { animatedTimingSpy };
  };

  it('does not call Animated.timing when it is undefined', () => {
    expect(setup(undefined).animatedTimingSpy).not.toHaveBeenCalled();
  });

  describe('when isVisible is set to true', () => {
    it('calls Animated.timing with toValue argument set as 1', () => {
      expect(setup(true).animatedTimingSpy).toHaveBeenCalledWith(expect.anything(), {
        duration: 200,
        toValue: 1,
        useNativeDriver: true,
      });
    });
  });

  describe('when isVisible is set to false', () => {
    it('calls Animated.timing with toValue argument set as 0', () => {
      expect(setup(false).animatedTimingSpy).toHaveBeenCalledWith(expect.anything(), {
        duration: 200,
        toValue: 0,
        useNativeDriver: true,
      });
    });
  });
});
