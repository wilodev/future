import React, { useEffect, useMemo, useRef } from 'react';
import {
  PixelRatio,
  Pressable,
  SectionList,
  SectionListProps,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from '~/designSystem/Icon';

import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { isIOS } from '~/utils/platform';
import useCheckStepCompletion from '../useCheckStepCompletion';
import { useSpacing, DefaultSpacing } from '~/designSystem/useSpacing';

const keyExtractor = ({ id }: { id: string }) => id;

export type ToDoListSection = {
  id: string;
  weekNumber: number;
  weekTitle: string;
  data: ToDoListItem[];
};

export type ToDoListStep = {
  id: string;
  itemType: 'Step';
  number: string;
  title: string;
  shortStepTypeLabel: string;
  contentType: string;
};

export type ToDoListActivity = {
  id: string;
  itemType: 'Activity';
  shortDescription: string;
  title: string;
};

export type ToDoListItem = ToDoListStep | ToDoListActivity;

export type ToDoListItemKey = Pick<ToDoListItem, 'id' | 'itemType'>;

type InternalItemKey = ToDoListItem['itemType'] | 'SectionHeader' | 'SectionFooter';

export type ToDoListProps = {
  currentItem?: ToDoListItemKey;
  onItemPress: (step: ToDoListItem) => void;
  enrolmentId: string;
} & Omit<SectionListProps<ToDoListItem, ToDoListSection>, 'keyExtractor' | 'renderItem'>;

export default function ToDoList({
  currentItem,
  onItemPress,
  contentContainerStyle,
  sections,
  enrolmentId,
  ...sectionListProps
}: ToDoListProps) {
  const { stepIsComplete } = useCheckStepCompletion(enrolmentId);
  const listRef = useRef<SectionList<ToDoListItem, ToDoListSection>>(null);

  const { fontScale } = useWindowDimensions();

  const itemHeights = useMemo(() => {
    const scalableParts = isIOS()
      ? { header: 55, activity: 64.5, step: 53 }
      : { header: 60, activity: 69, step: 54 };

    const calculateHeight = (itemType: keyof typeof scalableParts) =>
      ITEM_VERTICAL_PADDING * 2 +
      ITEM_INTERNAL_SPACING +
      PixelRatio.roundToNearestPixel(fontScale * scalableParts[itemType]);

    return {
      SectionHeader: calculateHeight('header'),
      SectionFooter: 0,
      Activity: calculateHeight('activity'),
      Step: calculateHeight('step'),
    };
  }, [fontScale]);

  const { colors } = useTheme();

  const styles = createStyleSheet(colors, itemHeights, useSpacing());

  const itemLayouts = useMemo(() => {
    const layouts: {
      index: number;
      length: number;
      offset: number;
    }[] = [];

    const addLayout = (itemType: keyof typeof itemHeights) => {
      const index = layouts.length;

      const previousItem = layouts[index - 1];

      layouts.push({
        index,
        length: itemHeights[itemType],
        offset: previousItem ? previousItem.offset + previousItem.length : 0,
      });
    };

    sections.forEach(({ data }) => {
      addLayout('SectionHeader');
      data.forEach(({ itemType }) => addLayout(itemType));
      addLayout('SectionFooter');
    });

    return layouts;
  }, [itemHeights, sections]);

  useEffect(() => {
    if (!currentItem) {
      return;
    }

    const allItems = sections.flatMap(({ data }, sectionIndex) =>
      data.map(({ itemType, id }, sectionItemIndex) => ({
        itemType,
        id,
        sectionIndex,
        sectionItemIndex,
      })),
    );

    const currentItemIndex = allItems.findIndex(
      item => item.itemType === currentItem.itemType && item.id === currentItem.id,
    );

    for (let i = currentItemIndex - 1; i > 0; i--) {
      const { itemType, sectionIndex, sectionItemIndex } = allItems[i];

      if (itemType === 'Step') {
        listRef.current?.scrollToLocation({
          sectionIndex,
          itemIndex: sectionItemIndex + 1,
          animated: false,
        });
        break;
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StepItem = ({ item }: { item: ToDoListStep }) => {
    const { title, number, shortStepTypeLabel } = item;

    const isCurrent = isCurrentItem(item);

    return (
      <Pressable
        style={[styles.itemContainer, styles.stepContainer]}
        onPress={() => onItemPress(item)}
        accessibilityRole="button">
        <View
          style={styles.stepLeftHeader}
          accessibilityLabel={`${
            stepIsComplete(item.id) ? 'completed' : 'Uncomplete'
          } step ${number}.`}>
          <Text weight="medium" size="small" color={isCurrent ? 'primary' : 'text'}>
            {number}
          </Text>
          {stepIsComplete(item.id) && (
            <Icon
              source={require('~/assets/tick-strong.png')}
              style={styles.completionIcon}
              tintColor={colors.primary}
              accessibilityLabel="Marked as complete"
            />
          )}
        </View>
        <View style={styles.stepDetails}>
          <Text
            weight={isCurrent ? 'medium' : 'regular'}
            size="small"
            color={isCurrent ? 'primary' : 'text'}
            numberOfLines={2}>
            {title}
          </Text>
          <Text size="xsmall" color={isCurrent ? 'primary' : 'textGrey'} style={styles.stepType}>
            {shortStepTypeLabel}
          </Text>
        </View>
      </Pressable>
    );
  };

  const ActivityItem = ({ item }: { item: ToDoListActivity }) => {
    const isCurrent = isCurrentItem(item);

    return (
      <Pressable
        style={[styles.itemContainer, styles.activityContainer]}
        onPress={() => onItemPress(item)}
        accessibilityRole="button">
        <Text
          size="small"
          weight="medium"
          color={isCurrent ? 'primary' : 'text'}
          numberOfLines={2}
          accessibilityLabel={`Activity: ${item.title}.`}>
          {item.title}
        </Text>
        <Text
          size="xsmall"
          color={isCurrent ? 'primary' : 'textGrey'}
          style={styles.activityDescription}
          numberOfLines={2}>
          {item.shortDescription}
        </Text>
      </Pressable>
    );
  };

  const getItemLayout = useMemo(
    () =>
      itemLayouts &&
      ((_: any, index: number) => itemLayouts[index] || { index, offset: 0, length: 0 }),
    [itemLayouts],
  );

  const renderItem = ({ item }: { item: ToDoListItem }) =>
    item.itemType === 'Activity' ? <ActivityItem item={item} /> : <StepItem item={item} />;

  const renderSectionHeader = ({
    section: { weekTitle, weekNumber },
  }: {
    section: ToDoListSection;
  }) => (
    <View style={[styles.itemContainer, styles.sectionHeader]}>
      <Text size="small" weight="medium" color="white" style={styles.weekNumber}>
        Week {weekNumber}:
      </Text>
      <Text size="small" color="white" numberOfLines={2}>
        {weekTitle}
      </Text>
    </View>
  );

  const isCurrentItem = ({ itemType, id }: ToDoListItem) =>
    itemType === currentItem?.itemType && id === currentItem.id;

  return (
    <SectionList
      keyExtractor={keyExtractor}
      ListEmptyComponent={<Text>This run does not contain any steps.</Text>}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      getItemLayout={getItemLayout}
      ref={listRef}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      sections={sections}
      stickySectionHeadersEnabled
      {...sectionListProps}
    />
  );
}

const ITEM_VERTICAL_PADDING = 8;
const ITEM_INTERNAL_SPACING = 4;

const createStyleSheet = (
  colors: Theme['colors'],
  itemHeights: Record<InternalItemKey, number>,
  { horizontalScreenPadding }: DefaultSpacing,
) =>
  StyleSheet.create({
    itemContainer: {
      paddingVertical: ITEM_VERTICAL_PADDING,
      paddingHorizontal: horizontalScreenPadding,
    },
    activityContainer: {
      height: itemHeights.Activity,
    },
    activityDescription: {
      marginTop: ITEM_INTERNAL_SPACING,
    },
    contentContainer: {
      paddingBottom: 64,
      backgroundColor: colors.backgroundAlt,
    },
    sectionHeader: {
      backgroundColor: colors.staticGrey700,
      height: itemHeights.SectionHeader,
      justifyContent: 'center',
    },
    weekNumber: {
      marginBottom: ITEM_INTERNAL_SPACING,
    },
    stepContainer: {
      flexDirection: 'row',
      height: itemHeights.Step,
    },
    stepLeftHeader: {
      minWidth: 44,
      paddingRight: 8,
    },
    stepDetails: {
      flex: 1,
    },
    stepType: {
      marginTop: ITEM_INTERNAL_SPACING,
      textTransform: 'capitalize',
    },
    completionIcon: {
      width: 18,
    },
  });
