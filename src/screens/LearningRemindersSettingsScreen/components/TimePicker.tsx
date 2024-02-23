import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View, GestureResponderEvent } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import Text from '~/designSystem/Text';
import { formatShortTime } from '~/utils/dateFormatting';
import { isIOS } from '~/utils/platform';

export enum EventType {
  dismissed = 'dismissed',
  set = 'set',
}

export default function TimePicker({
  value,
  onFormUpdate,
  scrollToTimePicker,
}: {
  value: number;
  onFormUpdate: (...event: any[]) => void;
  scrollToTimePicker: (event: GestureResponderEvent) => void;
}) {
  const [showPicker, setShowPicker] = useState(isIOS() ? true : false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const shouldCloseTimePicker =
      !isIOS() && (event.type === EventType.set || event.type === EventType.dismissed);
    const currentDate = selectedDate?.valueOf() || value;
    const shouldUpdateForm = isIOS() || event.type === EventType.set;

    shouldCloseTimePicker && setShowPicker(false);
    shouldUpdateForm && onFormUpdate(currentDate);
  };

  const styles = createStyleSheet();

  const renderRow = () => (
    <View style={styles.row}>
      <Text color="text" weight="semibold" style={styles.label}>
        Time
      </Text>
      <Text color="primary">{formatShortTime(new Date(value))}</Text>
    </View>
  );

  return (
    <>
      {isIOS() ? (
        <Pressable onPress={scrollToTimePicker}>{renderRow}</Pressable>
      ) : (
        <Pressable onPress={() => setShowPicker(!showPicker)}>{renderRow}</Pressable>
      )}
      {showPicker && (
        <View style={styles.picker}>
          <DateTimePicker
            testID="time"
            value={new Date(value)}
            mode="time"
            display={Platform.select({ ios: 'spinner' })}
            onChange={onChange}
            minuteInterval={isIOS() ? 15 : 1}
          />
        </View>
      )}
    </>
  );
}

const createStyleSheet = () =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    label: {
      marginVertical: 18,
    },
    picker: {
      flex: 1,
      justifyContent: 'center',
      marginBottom: isIOS() ? 80 : 0,
    },
  });
