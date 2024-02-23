import React from 'react';
import { Pressable, PressableProps } from 'react-native';

import Text, { TextProps } from '~/designSystem/Text';

type TextLinkProps = PressableProps & {
  text: string;
  textProps?: TextProps;
};

export default function TextLink({ text, textProps, ...props }: TextLinkProps) {
  return (
    <Pressable accessibilityRole="button" hitSlop={13} {...props}>
      <Text color="primary" {...textProps}>
        {text}
      </Text>
    </Pressable>
  );
}
