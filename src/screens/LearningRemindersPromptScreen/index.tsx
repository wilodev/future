import React, { useCallback, useEffect } from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';

import Text from '~/designSystem/Text';
import { useTheme } from '~/designSystem/themes';
import { RootNavigationProp } from '~/navigators/RootNavigationStack';
import Button from '~/designSystem/Button';
import { useAnalytics } from '~/utils/analytics';
import { markAsShown, PromptKey } from '~/utils/promotionalPrompts';

import Modal from './Modal';

export type LearningRemindersPromptScreenProps = {
  navigation: RootNavigationProp<'LearningRemindersPrompt'>;
};

export default function LearningRemindersPromptScreen({
  navigation: { goBack, navigate },
}: LearningRemindersPromptScreenProps) {
  const { dark } = useTheme();
  const { track } = useAnalytics();

  const image = dark
    ? require('~/assets/illustrations/cross-legged-gamers-dark.png')
    : require('~/assets/illustrations/cross-legged-gamers-light.png');

  const navigateToLearnReminderSettings = useCallback(() => {
    navigate('LearningRemindersSettings', { depth: 2, asModal: true });
    track('Open reminders settings', 'Reminders', { source: 'Prompt' });
  }, [navigate, track]);

  useEffect(() => {
    markAsShown(PromptKey.LearningReminders);
  }, []);

  const dismiss = (source: string) =>
    requestAnimationFrame(() => {
      goBack();
      track('Dismiss reminders prompt', 'Reminders', { source });
    });

  return (
    <Modal onClose={dismiss} maxDialogWidth={520}>
      <View style={styles.container}>
        <Image resizeMode="contain" style={styles.image} source={image} />
        <Text size="xlarge" weight="bold" style={styles.title}>
          Get a reminder to learn
        </Text>
        <Text style={styles.paragraph}>Life sometimes gets in the way and we forget to learn.</Text>
        <Text style={styles.paragraph}>
          Set up a learning reminder to notify you on your phone when it’s time to study.
        </Text>
        <Button
          onPress={navigateToLearnReminderSettings}
          title="Set a learning reminder"
          style={styles.primaryButton}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => dismiss('LaterButton')}
          style={styles.secondaryButton}>
          <Text weight="semibold" color="textGrey" style={styles.secondaryButtonText}>
            I’ll do it later on the Account screen
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const SPACING = 24;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING,
    paddingBottom: SPACING,
    textAlign: 'center',
  },
  title: {
    marginTop: SPACING + Platform.select({ ios: 4, default: 0 }),
    textAlign: 'center',
  },
  paragraph: {
    marginTop: SPACING - Platform.select({ ios: 4, default: 8 }),
    textAlign: 'center',
  },
  image: {
    height: 134,
    width: '100%',
  },

  primaryButton: {
    marginTop: SPACING + 8,
  },
  secondaryButton: {
    marginTop: SPACING,
  },
  secondaryButtonText: {
    textAlign: 'center',
  },
});
