import React, { useState } from 'react';
import {
  FlatList,
  FlatListProps,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import Text from '~/designSystem/Text';
import { useTheme } from '~/designSystem/themes';
import { useSpacing, DefaultSpacing } from '~/designSystem/useSpacing';
import { useMaxWidth } from '~/utils/useMaxWidth';
import { ImageWithCache } from '../ImagenWithCache';

export type CoursesListItem = {
  id: string;
  createdAt: string;
  imageUrl: string;
  organisationTitle: string;
  runTitle: string;
};

const NoCoursesFound = () => <Text>You are not enrolled in any courses at the moment.</Text>;

const keyExtractor = ({ id }: CoursesListItem) => id;
export const MIN_CARD_WIDTH = 300;

export type CoursesListProps<T> = {
  navigateToCourse: (item: T) => void;
  scrollOffset: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
} & Omit<FlatListProps<T>, 'keyExtractor' | 'renderItem'>;

function CoursesListInner<T extends CoursesListItem>(
  { navigateToCourse, contentContainerStyle, scrollOffset, ...flatListProps }: CoursesListProps<T>,
  ref: React.ForwardedRef<FlatList<any>>,
) {
  const { width } = useWindowDimensions();
  const { dark } = useTheme();
  const [_, setLoadingImages] = useState<Record<string, boolean>>({});

  const numColumns = Math.floor(width / MIN_CARD_WIDTH);
  const maxWidth = useMaxWidth(numColumns);

  const placeholderImage = dark
    ? require('~/assets/image-placeholder-dark.png')
    : require('~/assets/image-placeholder.png');

  const styles = createStyleSheet(useSpacing(), maxWidth);

  const renderItem = ({ item, index }: { item: T; index: number }) => {
    const { id, imageUrl, runTitle, organisationTitle, createdAt } = item;
    const joinedMonthYear = new Date(createdAt).toLocaleString(undefined, {
      month: 'short',
      year: 'numeric',
    });
    const joinedMonthYearLong = new Date(createdAt).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });

    const courseAccessibilityLabel = `
      Course ${index + 1} of ${flatListProps?.data?.length}.
      ${runTitle} by ${organisationTitle}. Joined ${joinedMonthYearLong}.
    `;

    const handleLoad = () => {
      setLoadingImages(prev => ({ ...prev, [id]: false }));
    };

    return (
      <View style={styles.courseCardContainer}>
        <Pressable
          style={styles.courseCard}
          onPress={() => navigateToCourse(item)}
          accessibilityLabel={courseAccessibilityLabel}
          accessibilityRole="button">
          <ImageWithCache
            resizeMode="cover"
            style={styles.image}
            source={{ uri: imageUrl }}
            placeholderSource={placeholderImage}
            accessibilityText={runTitle || 'Course image'}
            onImageLoad={handleLoad}
          />
          <View style={styles.text}>
            <Text color="textGreyAlt" numberOfLines={2} size="xsmall">
              {organisationTitle}
            </Text>
            <Text numberOfLines={3} weight="medium" size="small" style={styles.courseTitle}>
              {runTitle}
            </Text>
            <Text color="textGreyAlt" size="xsmall">
              Joined {joinedMonthYear}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      renderItem={renderItem}
      ListEmptyComponent={NoCoursesFound}
      numColumns={numColumns}
      key={numColumns.toString()}
      ListHeaderComponentStyle={styles.headerStyle}
      onScroll={scrollOffset}
      scrollEventThrottle={16}
      ref={ref}
      {...flatListProps}
    />
  );
}

const CoursesList = React.forwardRef(CoursesListInner) as <T>(
  props: CoursesListProps<T> & { ref?: React.ForwardedRef<FlatList> },
) => ReturnType<typeof CoursesListInner>;

export default CoursesList;

const createStyleSheet = ({ horizontalScreenPadding }: DefaultSpacing, maxWidth) =>
  StyleSheet.create({
    headerStyle: {
      paddingHorizontal: horizontalScreenPadding,
    },
    courseCard: {
      height: 122,
      flexDirection: 'row',
      width: '100%',
    },
    courseCardContainer: {
      paddingHorizontal: horizontalScreenPadding,
      marginBottom: 48,
      minWidth: MIN_CARD_WIDTH,
      width: '100%',
      maxWidth: maxWidth,
    },
    courseTitle: {
      marginVertical: 4,
    },
    image: {
      borderRadius: 5,
      width: 100,
    },
    text: {
      flex: 1,
      paddingLeft: 16,
    },
  });
