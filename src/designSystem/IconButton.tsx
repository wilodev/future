import React from 'react';
import {
  ImageSourcePropType,
  ImageStyle,
  Pressable,
  PressableProps,
  StyleProp,
} from 'react-native';

import Icon from './Icon';
import { useTheme } from './themes';

export type IconButtonProps = PressableProps & {
  iconStyle?: StyleProp<ImageStyle>;
  isPrimary?: boolean;
  source: ImageSourcePropType;
};

export default function IconButton(props: IconButtonProps) {
  const { colors } = useTheme();

  const { disabled, hitSlop = 8, iconStyle, isPrimary = false, source, ...otherProps } = props;

  const tintColor = disabled ? colors.inactive : isPrimary ? colors.primary : colors.icon;

  return (
    <Pressable accessibilityRole="button" disabled={disabled} hitSlop={hitSlop} {...otherProps}>
      <Icon source={source} tintColor={tintColor} style={iconStyle} />
    </Pressable>
  );
}
