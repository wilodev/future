import { useEffect, useMemo } from 'react';
import Sound from 'react-native-sound';

export type SoundOptions = { volume?: number };

export default function useSound(asset: NodeRequire, { volume }: SoundOptions = {}) {
  const sound = useMemo(() => {
    const newSound: Sound = new Sound(asset, () => {
      if (volume !== undefined) {
        newSound.setVolume(volume);
      }
    });
    return newSound;
  }, [asset, volume]);

  useEffect(
    () => () => {
      sound.release();
    },
    [sound],
  );

  return sound;
}
