import React, { RefCallback, useCallback, useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '~/designSystem/themes';
import { FontSize } from '~/designSystem/typography';

import Text from './Text';

type TextFieldProps = TextInputProps & {
  label: string;
  inputTestID?: string;
  style?: ViewStyle;
  refCallback?: RefCallback<TextInput>;
  errorMessage?: string;
  authError?: boolean;
};

export default function TextField({
  label,
  inputTestID,
  style,
  onFocus,
  onBlur,
  refCallback,
  errorMessage,
  authError,
  ...textInputProps
}: TextFieldProps) {
  const inputRef = useRef<TextInput | null>(null);
  const { colors } = useTheme();

  const onInputBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      inputRef?.current?.setNativeProps({
        style: { borderColor: errorMessage || authError ? colors.warning : colors.border },
      });
      if (onBlur) {
        onBlur(event);
      }
    },
    [onBlur, inputRef, colors, errorMessage, authError],
  );

  const onInputFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      inputRef?.current?.setNativeProps({
        style: { borderColor: colors.focus },
      });
      if (onFocus) {
        onFocus(event);
      }
    },
    [onFocus, inputRef, colors],
  );

  const textInputColors = {
    backgroundColor: colors.input,
    borderColor: colors.border,
    color: colors.text,
  };

  if (errorMessage || authError) {
    textInputColors.borderColor = colors.warning;
  }

  return (
    <View style={style}>
      <Text
        weight="semibold"
        color={errorMessage || authError ? 'warning' : 'text'}
        nativeID={`${label}Label`}>
        {label}
      </Text>
      <TextInput
        onFocus={event => onInputFocus(event)}
        onBlur={event => onInputBlur(event)}
        ref={e => {
          refCallback?.(e);
          inputRef.current = e;
        }}
        style={[styles.textInput, textInputColors]}
        testID={inputTestID}
        accessibilityLabelledBy={`${label}Label`}
        accessibilityHint={`This is the ${label} input field.`}
        {...textInputProps}
      />
      {errorMessage && (
        <Text
          color="warning"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.error}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 5,
    borderStyle: 'solid',
    borderWidth: 2,
    fontSize: FontSize.small,
    height: 56,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  error: {
    marginTop: 10,
  },
});
