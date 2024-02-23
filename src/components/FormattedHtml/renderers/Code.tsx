import '../../../../prism-config.js';
import React from 'react';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { useTheme } from '@react-navigation/native';
import { docco, dark as darkTheme } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {
  CustomRendererProps,
  CustomTextualRenderer,
  TPhrasing,
  TText,
} from 'react-native-render-html';

import { BASE_FONT_SIZE } from '../index';

const CodeRenderer: CustomTextualRenderer = (props: CustomRendererProps<TText | TPhrasing>) => {
  const { dark, colors } = useTheme();
  const { tnode, TDefaultRenderer } = props;

  const language = tnode.attributes['syntax-language'];

  if (!('data' in tnode)) {
    return <TDefaultRenderer {...props} />;
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={dark ? darkTheme : docco}
      customStyle={{ backgroundColor: colors.card }}
      highlighter="hljs"
      fontSize={BASE_FONT_SIZE}>
      {tnode.data}
    </SyntaxHighlighter>
  );
};

export default CodeRenderer;
