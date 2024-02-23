import React from 'react';
import { StyleSheet } from 'react-native';
import IconButton from '~/designSystem/IconButton';
import { useAnalytics } from '~/utils/analytics';
import { useSpacing, DefaultSpacing } from '~/designSystem/useSpacing';

export default function AccountButton({ navigate }: { navigate: (name: string) => void }) {
  const { track } = useAnalytics();

  const navigateToProfile = () => {
    track('Open account screen', 'Account');
    navigate('Account');
  };

  const styles = createStyleSheet(useSpacing());

  return (
    <IconButton
      accessibilityLabel="Account"
      onPress={navigateToProfile}
      source={require('~/assets/profile.png')}
      style={styles.profileButton}
      iconStyle={styles.profileIcon}
      testID="account-button"
    />
  );
}

const createStyleSheet = ({ horizontalScreenPadding }: DefaultSpacing) =>
  StyleSheet.create({
    profileButton: {
      marginRight: horizontalScreenPadding,
    },
    profileIcon: {
      width: 29,
      height: 29,
    },
  });
