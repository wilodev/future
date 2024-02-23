import React from 'react';
import { ColorValue, Image, ImageProps, ImageStyle } from 'react-native';

import { useTheme } from '~/designSystem/themes';

export type IconProps = ImageProps & { tintColor?: ColorValue; height?: number; width?: number };

const DEFAULT_SIZE = 24;

export default function Icon(props: IconProps) {
  const { colors } = useTheme();

  const {
    tintColor = colors.icon,
    height = DEFAULT_SIZE,
    width = DEFAULT_SIZE,
    style,
    ...otherProps
  } = props;

  const baseStyle: ImageStyle = {
    height,
    width,
    resizeMode: 'contain',
    tintColor,
  };

  return <Image style={[baseStyle, style]} {...otherProps} />;
}
