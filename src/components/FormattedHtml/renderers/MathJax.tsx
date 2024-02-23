import React from 'react';
import { useTheme } from '@react-navigation/native';
import MathJax from 'react-native-mathjax-svg';
import {
  CustomRendererProps,
  TPhrasing,
  TText,
  CustomTextualRenderer,
} from 'react-native-render-html';

import { BASE_FONT_SIZE } from '../index';

const MathJaxRenderer: CustomTextualRenderer = (props: CustomRendererProps<TText | TPhrasing>) => {
  const { tnode } = props;
  const { colors } = useTheme();

  const nativeTextFlow = tnode.parent?.styles.nativeTextFlow;
  const parentTextFontSize = nativeTextFlow?.fontSize ?? BASE_FONT_SIZE;

  const color = typeof nativeTextFlow?.color === 'string' ? nativeTextFlow.color : colors.text;

  return (
    <MathJax fontSize={parentTextFontSize} color={color}>
      {'data' in tnode ? tnode.data : ''}
    </MathJax>
  );
};

export default MathJaxRenderer;
