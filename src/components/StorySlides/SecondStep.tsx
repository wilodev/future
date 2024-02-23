import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import StorySlideLayout from '~/designSystem/StorySlideLayout';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { DataItemInterface } from '~/screens/CourseCompleteScreen/type';
import { truncate } from '~/utils/text';

type SecondStepProps = {
  data: DataItemInterface;
  handleCloseScreen: () => void;
  footerAction: () => void;
  header?: React.ReactNode;
};
export default function SecondStep({ data, header, handleCloseScreen }: SecondStepProps) {
  const theme = useTheme();
  theme.dark = true;
  const styles = createStyleSheet(theme);
  return (
    <StorySlideLayout
      backgroundImage={
        theme.dark
          ? require('~/assets/story-slides/backgrounds/dark/third-step.png')
          : require('~/assets/story-slides/backgrounds/light/third-step.png')
      }
      footer={<></>}
      header={header}
      handleCloseAction={handleCloseScreen}>
      <Text style={styles.title}>Your latest learning...</Text>
      <View style={styles.courseList}>
        {data.courses &&
          data?.courses?.map(item => (
            <View style={styles.courseItem} key={item.id}>
              <Image source={{ uri: item.image }} style={styles.courseImage} />
              <Text style={styles.courseTitle} numberOfLines={3} ellipsizeMode="tail">
                {truncate(item.title)}
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.bottomView}>
        <Text style={styles.textBottom}>View more courses on the FutureLearn website!</Text>
      </View>
    </StorySlideLayout>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: 22,
      // width: 200,
      // height: 68,
      lineHeight: 34,
      fontWeight: '700',
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginTop: -24,
      color: colors.white,
    },
    courseList: {
      width: '100%',
      marginTop: 24,
    },
    courseItem: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      justifyContent: 'space-between',
      marginVertical: 12,
    },
    courseImage: {
      width: 78,
      height: 78,
      resizeMode: 'cover',
      borderRadius: 20,
    },
    courseTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
      width: 250,
    },
    button: {
      width: 358,
      maxWidth: 358,
      height: 44,
      paddingHorizontal: 24,
      paddingVertical: 10,
      backgroundColor: colors.staticPink500,
    },
    textBottom: {
      textAlign: 'center',
      color: 'white',
      fontWeight: '400',
      fontSize: 22,
    },
    bottomView: {
      position: 'absolute',
      bottom: -30,
    },
  });
