import React from 'react';
import { StyleSheet } from 'react-native';
import StorySlideLayout from '~/designSystem/StorySlideLayout';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { DataItemInterface } from '~/screens/CourseCompleteScreen/type';

type FirstStepProps = {
  data: DataItemInterface;
  handleCloseScreen: () => void;
  footerAction: () => void;
  header?: React.ReactNode;
};

export default function FirstStep({ data, header, handleCloseScreen }: FirstStepProps) {
  const theme = useTheme();
  theme.dark = true;

  const styles = createStyleSheet(theme);
  return (
    <StorySlideLayout
      backgroundImage={
        theme.dark
          ? require('~/assets/story-slides/backgrounds/dark/second-step.png')
          : require('~/assets/story-slides/backgrounds/light/second-step.png')
      }
      footer={<></>}
      header={header}
      handleCloseAction={handleCloseScreen}>
      <Text style={styles.title} numberOfLines={2}>
        Woah! You’ve spent
      </Text>
      <Text style={styles.hours}>{data.hours}</Text>
      <Text style={styles.hoursTitle}>hours of learning</Text>
      <Text style={styles.hoursTitle}>in the FutureLearn app!</Text>
    </StorySlideLayout>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.white,
    },
    hours: {
      color: colors.white,
      fontSize: 120,
      fontWeight: 'bold',
      marginTop: 24,
    },
    hoursTitle: {
      fontSize: 17,
      lineHeight: 34,
      fontWeight: '500',
      color: colors.white,
    },
  });
