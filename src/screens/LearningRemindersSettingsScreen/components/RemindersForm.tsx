import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { StyleSheet, Switch, View } from 'react-native';

import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { daysOfWeekStartingMonday } from '~/utils/daysOfWeek';
import { RemindersData } from '~/utils/notifications';
import { isIOS } from '~/utils/platform';

import DayCheckbox from './DayCheckbox';
import TimePicker from './TimePicker';

type FormProps = {
  initialFormData: RemindersData;
  onFormValuesUpdate: ({ remindersData }: { remindersData: RemindersData }) => void;
  scrollToEnd: () => void;
};

export default function RemindersForm({
  initialFormData: initialFormData,
  onFormValuesUpdate,
  scrollToEnd,
}: FormProps) {
  const styles = createStyleSheet(useTheme());

  const { control } = useForm<RemindersData>({
    defaultValues: initialFormData,
  });

  const allFieldValues = useWatch({ control });

  useEffect(() => {
    onFormValuesUpdate({ remindersData: allFieldValues });
  }, [onFormValuesUpdate, allFieldValues]);

  return (
    <>
      <Text>
        Receive notifications to stay on track - you can change these any time. Select the days and
        time you would like to receive reminders.
      </Text>
      <Controller
        control={control}
        name="useReminders"
        render={({ field: { onChange, value } }) => (
          <View style={styles.switchContainer}>
            <Text
              weight="semibold"
              style={styles.switchLabel}
              accessibilityLabel={`Use reminders. ${value ? 'on' : 'off'}`}>
              Use reminders
            </Text>
            <Switch
              accessibilityLabel="Use reminders"
              accessibilityRole="switch"
              accessibilityState={isIOS() ? { checked: value } : undefined}
              onValueChange={onChange}
              value={value}
              testID="useReminders"
            />
          </View>
        )}
      />
      <Text style={styles.daysHeader} weight="semibold">
        Days
      </Text>
      {daysOfWeekStartingMonday().map(day => (
        <Controller
          key={day}
          control={control}
          name={day}
          render={({ field: { onChange, value } }) => (
            <DayCheckbox day={day} value={value} onChange={onChange} />
          )}
        />
      ))}
      <Controller
        control={control}
        name="time"
        render={({ field: { onChange, value } }) => (
          <TimePicker value={value!} onFormUpdate={onChange} scrollToTimePicker={scrollToEnd} />
        )}
      />
    </>
  );
}

const SPACING = 24;

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    switchContainer: {
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    switchLabel: {
      marginVertical: SPACING,
    },
    daysHeader: {
      marginTop: SPACING,
      marginBottom: 10,
    },
  });
