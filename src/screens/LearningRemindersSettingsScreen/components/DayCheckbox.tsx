import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import CheckBox from '@react-native-community/checkbox';
import Text from '~/designSystem/Text';

import { DayOfWeek } from '~/utils/daysOfWeek';
import { isIOS } from '~/utils/platform';
import { Theme, useTheme } from '~/designSystem/themes';

export default function DayCheckbox({
  day,
  value,
  onChange,
}: {
  day: DayOfWeek;
  value?: boolean;
  onChange: (...event: any[]) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyleSheet(colors, isIOS());

  return (
    <Pressable
      style={styles.row}
      onPress={() => onChange(!value)}
      accessibilityLabel={day}
      accessibilityState={{ checked: value }}>
      <Text style={styles.label} color={value ? 'primary' : 'text'}>
        {day}
      </Text>
      <CheckBox
        accessibilityLabel={day}
        accessibilityRole="checkbox"
        value={value}
        onCheckColor={colors.primary}
        onFillColor={colors.checkbox}
        onTintColor={colors.checkbox}
        onValueChange={onChange}
        tintColor={colors.checkbox}
        tintColors={{ true: colors.primary, false: colors.checkbox }}
        testID={day}
        animationDuration={0.25}
        onAnimationType="bounce"
        offAnimationType="bounce"
      />
    </Pressable>
  );
}

const createStyleSheet = (colors: Theme['colors'], isIOSDevice: boolean) =>
  StyleSheet.create({
    row: {
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderAlt,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingRight: isIOSDevice ? 1 : 0,
    },
    label: {
      textTransform: 'capitalize',
      marginVertical: 18,
    },
  });
