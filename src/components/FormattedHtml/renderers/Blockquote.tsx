import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { CustomRendererProps, TBlock, TPhrasing, TText } from 'react-native-render-html';

import { useTheme } from '~/designSystem/themes';

export default function BlockquoteRenderer(props: CustomRendererProps<TBlock | TText | TPhrasing>) {
  const { TDefaultRenderer, tnode } = props;
  const { colors } = useTheme();

  const numberOfChildren = tnode.children.length;
  if (numberOfChildren) {
    tnode.children[0].styles.nativeBlockRet.marginTop = 0;
    tnode.children[numberOfChildren - 1].styles.nativeBlockRet.marginBottom = 0;
  }

  const blockquoteStyles: StyleProp<ViewStyle> = {
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    paddingLeft: 16,
    marginLeft: 0,
    marginTop: 0,
  };

  return <TDefaultRenderer {...props} tnode={tnode} style={[props.style, blockquoteStyles]} />;
}
