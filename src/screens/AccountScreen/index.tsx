import React, { useContext, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import Config from 'react-native-config';

import ActivityIndicator from '~/designSystem/ActivityIndicator';
import ErrorBanner from '~/designSystem/ErrorBanner';
import Icon from '~/designSystem/Icon';
import Text from '~/designSystem/Text';
import TextLink from '~/designSystem/TextLink';
import { Theme, useTheme } from '~/designSystem/themes';
import { RootNavigationProp } from '~/navigators/RootNavigationStack';
import { useAnalytics } from '~/utils/analytics';
import { AuthenticationTokenContext } from '~/utils/AuthenticationTokenContext';
import { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import { Spacing } from '~/designSystem/useSpacing';
import StoryModal from '../CourseCompleteScreen/storyModal';

import { useUserProfileQuery } from './UserProfileQuery.generated';
import { ENV } from '~/config/env';

export type AccountScreenProps = {
  navigation: RootNavigationProp<'Account'>;
};

export default function AccountScreen({ navigation: { navigate } }: AccountScreenProps) {
  const { loading, error, data } = useUserProfileQuery();

  const { discardToken } = useContext(AuthenticationTokenContext);
  const styles = createStyleSheet(useTheme());
  const { track } = useAnalytics();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <>
      {error && <ErrorBanner />}
      <ScrollView contentContainerStyle={styles.container}>
        <Text color="textGrey" size="xsmall" style={styles.heading}>
          Profile
        </Text>
        {loading && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator />
          </View>
        )}
        {data && <Text style={styles.item}>Signed in as {data.currentUser?.email}</Text>}
        <TextLink onPress={discardToken} text="Sign out" style={styles.signOutButton} />

        <View style={styles.divider} />
        <Text color="textGrey" size="xsmall" style={styles.heading}>
          Settings
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            navigate('LearningRemindersSettings', {});
            track('Open reminders settings', 'Reminders', { source: 'Account' });
          }}
          style={styles.item}
          hitSlop={13}>
          <View style={styles.itemTextContainer}>
            <Text>Learning reminders</Text>
            <Text size="small" color="textGrey" style={styles.itemDescription}>
              Get notifications on your phone to remind you when to study
            </Text>
          </View>

          <Icon style={styles.itemIcon} source={require('~/assets/chevron-right.png')} />
        </Pressable>

        {/* Apply Condition from Backend Data */}
        {/* <Pressable
          accessibilityRole="button"
          onPress={() => {
            setModalVisible(true);
            track('Open reminders CourseCompleteScreen', 'Course', {
              source: 'CourseCompleteScreen',
            });
          }}
          style={styles.item}
          hitSlop={13}>
          <View style={styles.itemTextContainer}>
            <Text>Learning Summary</Text>
            <Text size="small" color="textGrey" style={styles.itemDescription}>
              Access your latest learning roundup
            </Text>
          </View>

          <Icon style={styles.itemIcon} source={require('~/assets/chevron-right.png')} />
        </Pressable> */}

        <StoryModal
          state={modalVisible}
          onPressHide={() => setModalVisible(false)}
          onClose={() => {
            setModalVisible(false);
          }}
        />

        <View style={styles.divider} />
        <Text color="textGrey" size="xsmall" style={styles.heading}>
          About
        </Text>
        <TextLink
          onPress={() => Linking.openURL(ENV.TERMS_URL)}
          text="Terms and conditions"
          style={styles.item}
        />
        <TextLink
          onPress={() => Linking.openURL(ENV.PRIVACY_POLICY_URL)}
          text="Privacy policy"
          style={styles.item}
        />
        <View style={styles.divider} />
        <Text color="textGrey" size="xsmall" style={styles.heading}>
          App Help
        </Text>
        <TextLink
          onPress={() => Linking.openURL(ENV.Feedback)}
          text="Feedback"
          style={styles.item}
        />
        <TextLink
          onPress={() => Linking.openURL(ENV.CONTACT_US_URL)}
          text="Contact us"
          style={styles.item}
        />
        <View style={styles.divider} />
        <Text style={styles.item}>
          App Version {getVersion()} ({getBuildNumber()})
        </Text>
        {Config.BUILD_COMMIT && <Text style={styles.item}>Build commit {Config.BUILD_COMMIT}</Text>}
      </ScrollView>
    </>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      alignSelf: 'center',
      paddingHorizontal: Spacing.small,
      paddingBottom: Spacing.medium,
      maxWidth: LARGE_DEVICE_CONTAINER_WIDTH,
      width: '100%',
    },
    heading: {
      marginTop: Spacing.medium,
      textTransform: 'uppercase',
    },
    item: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      marginTop: Spacing.medium,
    },
    itemTextContainer: {
      flexGrow: 1,
      flexShrink: 1,
    },
    itemDescription: {
      marginTop: Spacing.small,
    },
    itemIcon: {
      alignSelf: 'center',
      flexShrink: 0,
      marginLeft: Spacing.small,
    },
    divider: {
      marginTop: Spacing.medium,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderAlt,
    },
    activityIndicatorContainer: {
      marginTop: Spacing.medium,
    },
    signOutButton: {
      marginTop: Spacing.small,
      alignSelf: 'flex-start',
    },
  });
