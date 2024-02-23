import React from 'react';
import { Image, StyleSheet } from 'react-native';

import Button from '~/designSystem/Button';

import StorySlideLayout from '~/designSystem/StorySlideLayout';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';

type MainProps = {
  footerAction: () => void;
  hasHeader: boolean;
};
export default function Main({ footerAction, hasHeader }: MainProps) {
  let theme = useTheme();
  theme.dark = true;

  const styles = createStyleSheet(theme);

  return (
    <StorySlideLayout
      backgroundImage={
        theme.dark
          ? require('~/assets/story-slides/backgrounds/dark/first-step.png')
          : require('~/assets/story-slides/backgrounds/light/first-step.png')
      }
      footer={
        <Button
          title="Show me"
          type="story"
          accessibilityLabel="Show me"
          testID="Show-me"
          style={styles.button}
          onPress={footerAction}
        />
      }
      hasHeader={hasHeader}>
      <Image
        source={
          theme.dark
            ? require('~/assets/story-slides/illustrations/dark/achievements-accomplishment-mountain.png')
            : require('~/assets/story-slides/illustrations/light/achievements-accomplishment-mountain.png')
        }
      />

      <Text weight="bold" size="xlarge" style={styles.title}>
        You did it!
      </Text>
      <Text style={styles.description}>
        You’ve completed your course, let’s see your milestones you’ve reached during this learning
        phase...
      </Text>
    </StorySlideLayout>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    title: {
      marginTop: 24,
      color: colors.white,
    },
    description: {
      marginVertical: 18,
      marginHorizontal: 2,
      fontSize: 22,
      lineHeight: 34,
      fontWeight: '400',
      textAlign: 'center',
      color: colors.white,
    },
    button: {
      width: 358,
      maxWidth: 358,
      height: 44,
      paddingHorizontal: 24,
      paddingVertical: 10,
      backgroundColor: colors.staticPink500,
    },
  });
