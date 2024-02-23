import useLargeDevice from '~/utils/useLargeDevice';

export enum Spacing {
  'none' = 0,
  'xxxsmall' = 2,
  'xxsmall' = 4,
  'xsmall' = 8,
  'small' = 16,
  'medium' = 24,
  'large' = 32,
  'xlarge' = 40,
  'xxlarge' = 48,
  'xxxlarge' = 64,
}

export type DefaultSpacing = { horizontalScreenPadding: Spacing };

export const useSpacing = (): DefaultSpacing => {
  const { isLargeDevice } = useLargeDevice();
  const horizontalScreenPadding = isLargeDevice ? Spacing.medium : Spacing.small;

  return { horizontalScreenPadding };
};
