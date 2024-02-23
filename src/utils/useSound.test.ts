import { renderHook } from '@testing-library/react-hooks';
import Sound from 'react-native-sound';

import mockSound from '~/__mocks__/react-native-sound';

import useSound, { SoundOptions } from './useSound';

describe('useSound', () => {
  beforeEach(() => jest.useFakeTimers());

  const asset = 'fake/asset' as any as NodeRequire;

  const render = (options?: SoundOptions) => renderHook(() => useSound(asset, options));

  it('initializes the sound with the specified asset', () => {
    render();
    expect(Sound).toHaveBeenCalledWith(asset, expect.anything());
  });

  it('returns the sound', () => {
    expect(render().result.current).toBe(mockSound.mock.instances[0]);
  });

  it('memoizes the sound', () => {
    const { rerender } = render();
    rerender();
    expect(Sound).toHaveBeenCalledTimes(1);
  });

  describe('when a volume is specified', () => {
    it('sets the volume once the sound has been initialized', () => {
      render({ volume: 0.5 });

      jest.runAllTimers();

      expect(mockSound.mock.instances[0].setVolume).toHaveBeenCalledWith(0.5);
    });
  });

  describe('when the component is unmounted', () => {
    it('releases the resources associated with the sound', () => {
      render().unmount();
      expect(mockSound.mock.instances[0].release).toHaveBeenCalled();
    });
  });
});
