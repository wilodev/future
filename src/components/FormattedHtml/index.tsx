import React, { useMemo } from 'react';
import HTML, {
  HTMLContentModel,
  HTMLElementModel,
  MixedStyleRecord,
} from 'react-native-render-html';

import { ColorName, useTheme } from '~/designSystem/themes';
import { FontSize, FontWeight } from '~/designSystem/typography';

import BlockquoteRenderer from './renderers/Blockquote';
import CodeRenderer from './renderers/Code';
import MathJaxRenderer from './renderers/MathJax';
import { SubscriptRenderer, SuperscriptRenderer } from './renderers/SubscriptSuperscript';

export const BASE_FONT_SIZE = FontSize.medium;

const renderers = {
  blockquote: BlockquoteRenderer,
  code: CodeRenderer,
  sup: SuperscriptRenderer,
  sub: SubscriptRenderer,
  'latex-formula': MathJaxRenderer,
};

const customHTMLElementModels = {
  'latex-formula': HTMLElementModel.fromCustomModel({
    tagName: 'latex-formula',
    contentModel: HTMLContentModel.mixed,
    isOpaque: true,
  }),
};

export default function FormattedHTML({
  contentWidth,
  html,
  color,
  size,
}: {
  contentWidth: number;
  html: string;
  color?: ColorName;
  size?: keyof typeof FontSize;
}) {
  const { colors } = useTheme();

  const defaultFontSize = (size && FontSize[size]) ?? BASE_FONT_SIZE;

  const baseStyle = useMemo(
    () => ({
      color: color ? colors[color] : colors.text,
      fontSize: defaultFontSize,
      letterSpacing: 0.4,
      lineHeight: defaultFontSize * 1.4,
    }),
    [colors, color, defaultFontSize],
  );

  const tagsStyles: MixedStyleRecord = useMemo(
    () => ({
      h1: headerStyles(FontSize.xxlarge),
      h2: headerStyles(FontSize.xlarge),
      h3: headerStyles(FontSize.large),
      h4: headerStyles(FontSize.medium),
      h5: headerStyles(FontSize.small),
      h6: headerStyles(FontSize.xsmall),
      a: {
        color: colors.primary,
        textDecorationLine: 'none',
        fontWeight: FontWeight.medium,
      },
      li: {
        fontSize: defaultFontSize,
        paddingLeft: 15,
      },
      p: {
        marginBottom: defaultFontSize,
        marginTop: 0,
      },
    }),
    [colors.primary, defaultFontSize],
  );

  return (
    <HTML
      source={{ html }}
      contentWidth={contentWidth}
      baseStyle={baseStyle}
      tagsStyles={tagsStyles}
      renderers={renderers}
      customHTMLElementModels={customHTMLElementModels}
    />
  );
}

const headerStyles = (fontSize: FontSize) => {
  return {
    fontSize: fontSize,
    lineHeight: fontSize * 1.2,
    marginTop: fontSize + 5,
    marginBottom: fontSize + 5,
  };
};
