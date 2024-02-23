import React from 'react';
import { StyleSheet } from 'react-native';
import StorySlideLayout from '~/designSystem/StorySlideLayout';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { DataItemInterface } from '~/screens/CourseCompleteScreen/type';

type ThirdStepProps = {
  data: DataItemInterface;
  handleCloseScreen: () => void;
  footerAction: () => void;
  header?: React.ReactNode;
};

export default function ThirdStep({ header, handleCloseScreen }: ThirdStepProps) {
  const theme = useTheme();
  theme.dark = true;
  const styles = createStyleSheet(theme);

  return (
    <StorySlideLayout
      backgroundImage={
        theme.dark
          ? require('~/assets/story-slides/backgrounds/dark/fourth-step.png')
          : require('~/assets/story-slides/backgrounds/light/fourth-step.png')
      }
      footer={<></>}
      header={header}
      handleCloseAction={handleCloseScreen}>
      <Text style={styles.title}>Superstar!</Text>
      <Text style={styles.valueRate}>
        Enjoying learning in the app? We’d love to hear from you, just tap the survey link below
      </Text>
    </StorySlideLayout>
  );
}

const createStyleSheet = ({ colors, dark }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: 'bold',
      // color: colors.textColorStories,
      color: colors.white,
      marginTop: 16,
    },
    valueRate: {
      fontSize: 22,
      fontWeight: '400',
      textAlign: 'center',
      color: dark ? colors.white : colors.staticPink500,
      margin: 25,
    },
    textRate: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
      lineHeight: 34,
      textDecorationLine: 'underline',
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
