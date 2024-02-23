import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '~/designSystem/Text';
import { Theme } from '~/designSystem/themes';
import Icon from '~/designSystem/Icon';

export const ErrorMessage: FC<{
  error: string;
  theme: Theme;
}> = ({ error, theme }) => {
  const styles = createStyleSheet(theme);
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon
          width={15}
          height={15}
          source={require('~/assets/alert.png')}
          tintColor={theme.colors.posterIconBackground}
          style={styles.icon}
        />
      </View>
      <Text
        color="focus"
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        style={styles.message}>
        {error}
      </Text>
    </View>
  );
};

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: 40,
      marginRight: 20,
    },
    iconContainer: {
      backgroundColor: colors.warningBackground,
      justifyContent: 'center',
      alignItems: 'center',
      width: 25,
      height: 25,
    },
    icon: {
      width: 15,
      height: 15,
    },
    message: {
      marginTop: 0,
      fontSize: 16,
      fontStyle: 'italic',
      marginLeft: 6,
      fontWeight: '400',
      lineHeight: 24,
    },
  });
