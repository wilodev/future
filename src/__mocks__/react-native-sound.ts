import Sound from 'react-native-sound';

export const mockSound: jest.MockedClass<typeof Sound> = jest.fn().mockImplementation(function (
  this: Sound,
  _: any,
  callback?: () => void,
) {
  this.play = jest.fn();
  this.release = jest.fn();
  this.setVolume = jest.fn();

  if (callback) {
    setTimeout(callback, 0);
  }

  return this;
}) as any;

mockSound.setCategory = jest.fn();

export default mockSound;
