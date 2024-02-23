import { StackCardInterpolatedStyle, StackCardInterpolationProps } from '@react-navigation/stack';

export const fadeIn = ({
  current: { progress },
}: StackCardInterpolationProps): StackCardInterpolatedStyle => ({
  cardStyle: {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
  },
  overlayStyle: {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
      extrapolate: 'clamp',
    }),
  },
});

export const revealFromBottom = ({
  current: { progress },
  layouts: { screen },
}: StackCardInterpolationProps): StackCardInterpolatedStyle => ({
  cardStyle: {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [screen.height, 0],
          extrapolate: 'clamp',
        }),
      },
    ],
  },
  overlayStyle: {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
      extrapolate: 'clamp',
    }),
  },
});
