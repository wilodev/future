import { View, StyleSheet, Linking } from 'react-native';
import React, { FC } from 'react';
import TextLink from '~/designSystem/TextLink';
import { Theme, useTheme } from '~/designSystem/themes';

export const UnderLineLink: FC<{
  text: string;
  url: string;
}> = ({ text, url }) => {
  const theme = useTheme();
  const styles = createStyleSheet(theme);
  return (
    <View style={styles.container}>
      <TextLink
        onPress={() => Linking.openURL(url)}
        text={text}
        style={styles.link}
        textProps={{
          size: 'small',
          children: null,
          weight: 'medium',
          lineHeight: 48,
        }}
      />
      <View style={styles.underline} />
    </View>
  );
};
const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      position: 'relative',
    },
    link: {
      alignSelf: 'flex-start',
      // marginBottom: -48,
      //marginTop: -4,
      marginBottom: 24,
    },
    underline: {
      height: 2,
      width: '98%',
      marginLeft: 2,
      backgroundColor: colors.primary,
      position: 'absolute',
      bottom: 32,
    },
  });
