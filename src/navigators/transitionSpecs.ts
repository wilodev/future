import { Easing } from 'react-native';
import { TransitionSpec } from '@react-navigation/stack/lib/typescript/src/types';

export const openModal: TransitionSpec = {
  animation: 'timing',
  config: {
    easing: Easing.bezier(0, 0, 0.2, 1),
    duration: 250,
  },
};
export const closeModal: TransitionSpec = {
  animation: 'timing',
  config: {
    easing: Easing.bezier(0.4, 0, 1, 1),
    duration: 200,
  },
};
