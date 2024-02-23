import React from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';

import BackgroundLinearGradient from '~/designSystem/BackgroundLinearGradient';
import Icon from '~/designSystem/Icon';
// import ShareAchievement from '~/designSystem/ShareAchievement';
import StorySlideLayout from '~/designSystem/StorySlideLayout';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { DataItemInterface } from '~/screens/CourseCompleteScreen/type';
import { truncate } from '~/utils/text';

type FourthStepProps = {
  data: DataItemInterface;
  handleCloseScreen: () => void;
  footerAction: () => void;
  header?: React.ReactNode;
};
export default function FourthStep({ data, header, handleCloseScreen }: FourthStepProps) {
  let theme = useTheme();
  theme.dark = true;
  const styles = createStyleSheet(theme);
  return (
    <StorySlideLayout
      backgroundImage={
        theme.dark
          ? require('~/assets/story-slides/backgrounds/dark/fifth-step.png')
          : require('~/assets/story-slides/backgrounds/light/fifth-step.png')
      }
      footer={''}
      header={header}
      handleCloseAction={handleCloseScreen}>
      <Text style={styles.title}>Here’s your learning unlocked</Text>
      <View style={styles.gradientContainer}>
        <BackgroundLinearGradient
          width={164}
          height={212}
          startColor={theme.dark ? theme.colors.staticBlue500 : theme.colors.staticPink300}
          endColor={theme.dark ? theme.colors.staticPurple500 : theme.colors.staticPink300}>
          <View style={styles.gradientContent}>
            <Icon
              source={require('~/assets/story-slides/icons/hourglass.png')}
              width={42}
              height={42}
              style={styles.icon}
            />
            <View style={styles.hourContainer}>
              <Text style={styles.hourValue}>{data.hours}</Text>
              <Text style={styles.hourText}>hrs</Text>
            </View>
            <Text style={styles.text}>learing</Text>
          </View>
        </BackgroundLinearGradient>
        <BackgroundLinearGradient
          width={164}
          height={212}
          startColor={theme.dark ? theme.colors.staticPink500 : theme.colors.warningBackground}
          endColor={theme.dark ? theme.colors.warningBackground : theme.colors.warningBackground}>
          <View style={styles.gradientContent}>
            <Icon
              source={require('~/assets/story-slides/icons/awards.png')}
              width={42}
              height={42}
              style={styles.icon}
            />
            <Text style={styles.rateText}>{data.rate}%</Text>
            <Text style={styles.text}>quiz success</Text>
          </View>
        </BackgroundLinearGradient>
      </View>
      <View style={styles.flatListContainer}>
        <FlatList
          data={data.courses}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.courseItemContainer}>
              <View style={styles.courseImageContainer}>
                <Image source={{ uri: item.image }} style={styles.courseImageImage} />
                <View style={styles.courseImageIconContainer}>
                  <Icon
                    style={styles.courseImageIconIcon}
                    source={require('~/assets/tick.png')}
                    width={18}
                    height={18}
                  />
                </View>
              </View>
              <Text style={styles.courseTitle}>{truncate(item.title)}</Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          centerContent
          scrollEnabled
        />
      </View>
    </StorySlideLayout>
  );
}

const createStyleSheet = ({ colors, dark }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: 32,
      lineHeight: 42,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.textColorStories,
    },
    gradientContainer: {
      marginTop: 24,
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    gradientContent: {
      color: colors.textColorStories,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
    },
    icon: {
      tintColor: colors.text,
      marginBottom: 24,
      marginTop: 8,
    },
    hourContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
    hourValue: {
      color: colors.staticPink500,
      fontSize: 42,
      fontWeight: 'bold',
      alignSelf: 'flex-end',
    },
    hourText: {
      color: dark ? colors.staticPink500 : colors.textColorStories,
      fontSize: 18,
      fontWeight: 'bold',
      alignSelf: 'flex-end',
      marginBottom: 6,
    },
    rateText: {
      color: dark ? colors.staticBlack : colors.textColorStories,
      fontSize: 42,
      fontWeight: 'bold',
    },
    text: {
      color: dark ? colors.staticBlack : colors.textColorStories,
      fontSize: 24,
      lineHeight: 44,
      fontWeight: '500',
    },
    flatListContainer: {
      width: '100%',
      height: 189,
      overflow: 'hidden',
      marginTop: 24,
    },
    courseItemContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: 142,
      height: 190,
      marginRight: 16,
    },
    courseImageContainer: {
      display: 'flex',
      width: 121,
      height: 121,
      position: 'relative',
    },
    courseImageIconContainer: {
      position: 'absolute',
      top: 10,
      right: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 20,
      padding: 8,
    },
    courseImageIconIcon: {
      tintColor: colors.staticPink500,
    },
    courseImageImage: {
      resizeMode: 'cover',
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 12,
      letterSpacing: 0.36,
    },
  });
