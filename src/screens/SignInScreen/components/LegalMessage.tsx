import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ENV } from '~/config/env';
import Text from '~/designSystem/Text';
import { UnderLineLink } from './UnderLineLink';
import useLargeDevice from '~/utils/useLargeDevice';

export const LegalMessage = () => {
  const styles = createStyleSheet();
  const { height } = useLargeDevice();
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          color="text"
          accessibilityRole="text"
          accessibilityLiveRegion="assertive"
          style={styles.text}>
          By signing in, you accept FutureLearn’s
        </Text>
      </View>
      {height > 700 ? (
        <View style={styles.gap}>
          <View style={styles.textContainer}>
            <UnderLineLink text=" Terms and Conditions" url={ENV.TERMS_URL} />
          </View>
          <View style={styles.textContainer}>
            <UnderLineLink text="Privacy Policy" url={ENV.PRIVACY_POLICY_URL} />
          </View>
        </View>
      ) : (
        <View style={styles.textContainer}>
          <UnderLineLink text="Terms and Conditions" url={ENV.TERMS_URL} />
          <Text
            color="text"
            accessibilityRole="text"
            accessibilityLiveRegion="assertive"
            style={styles.text_second}>
            {' '}
            and{' '}
          </Text>
          <UnderLineLink text="Privacy Policy" url={ENV.PRIVACY_POLICY_URL} />
        </View>
      )}
    </View>
  );
};

const createStyleSheet = () =>
  StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
    },
    textContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    text: {
      marginTop: 0,
      fontSize: 15,
      marginLeft: 2,
      fontWeight: '500',
      lineHeight: 36,
    },
    text_second: {
      marginTop: 0,
      fontSize: 15,
      marginLeft: 2,
      fontWeight: '500',
      lineHeight: 48,
    },
    gap: {
      gap: -25,
      width: '100%',
    },
  });
