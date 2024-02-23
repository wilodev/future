import React from 'react';
import { View, Platform } from 'react-native';
import { CustomTextualRenderer } from 'react-native-render-html';
import { BASE_FONT_SIZE } from '../index';

const defineRenderer =
  (calculateBottomMargin: (parentFontSize: number) => number | undefined): CustomTextualRenderer =>
  props => {
    const { tnode, TDefaultRenderer } = props;

    const nativeTextFlow = tnode.parent?.styles.nativeTextFlow;
    const parentTextFontSize = nativeTextFlow?.fontSize ?? BASE_FONT_SIZE;
    const parentTextLineHeight = nativeTextFlow?.lineHeight ?? parentTextFontSize * 1.2;

    const style = {
      fontSize: parentTextFontSize * 0.6835,
      lineHeight: parentTextLineHeight * 0.6,
      marginBottom: calculateBottomMargin(parentTextFontSize),
    };

    return (
      <View>
        <TDefaultRenderer {...props} style={[props.style, style]} />
      </View>
    );
  };

export const SubscriptRenderer = defineRenderer(parentTextFontSize =>
  Platform.select({
    ios: -6,
    android: parentTextFontSize * -0.3,
  }),
);

export const SuperscriptRenderer = defineRenderer(parentTextFontSize =>
  Platform.select({
    ios: parentTextFontSize * 0.35,
    android: parentTextFontSize * 0.15,
  }),
);
