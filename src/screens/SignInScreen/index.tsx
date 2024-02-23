import React, { useContext, useState } from 'react';
import { AccessibilityInfo, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import TextField from '~/designSystem/TextField';
import { AuthenticationTokenContext } from '~/utils/AuthenticationTokenContext';
import { useTheme } from '~/designSystem/themes';

import {
  UserAuthenticateMutationVariables,
  useUserAuthenticateMutation,
} from './UserAuthenticateMutation.generated';
import useLargeDevice from '~/utils/useLargeDevice';
import { ErrorMessage } from './components/ErrorMessage';
import { LegalMessage } from './components/LegalMessage';
import SwipeModal from './swipeModal';
// import JailMonkey from 'jail-monkey';

export default function SignInScreen() {
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserAuthenticateMutationVariables>();
  const { isLargeDevice, height } = useLargeDevice();
  const styles = createStyleSheet(height, Platform.OS);
  const { setToken } = useContext(AuthenticationTokenContext);
  const reportError = (message = "Something's not right. Please try again later.") => {
    AccessibilityInfo.announceForAccessibility(message);
    setErrorMessage(message);
  };

  const [authenticate, { data, loading }] = useUserAuthenticateMutation({
    fetchPolicy: 'no-cache',
    async onCompleted({ userAuthenticate }) {
      const token = userAuthenticate?.token;

      if (token) {
        await setToken(token);
      } else {
        reportError(userAuthenticate?.errors[0]?.message);
      }
    },
    onError() {
      reportError();
    },
  });

  const handleChange = (value: string, onChange) => {
    const space = /\s/;
    if (!space.test(value)) {
      onChange(value);
    }
  };
  const signIn = (formData: UserAuthenticateMutationVariables) => {
    authenticate({ variables: formData, context: { confidential: true } });
  };

  const signingIn = loading || !!data?.userAuthenticate?.token;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
        <View
          style={[styles.screenContainer, isLargeDevice && styles.fixedWidthOnTablet]}
          testID="signin-container">
          <View style={styles.wrapper}>
            <Text
              accessibilityLabel="Sign in using the fields below"
              accessibilityRole="header"
              size="large"
              style={styles.title}>
              Welcome to FutureLearn
            </Text>
            <Controller
              control={control}
              name="email"
              defaultValue=""
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <TextField
                  autoCapitalize="none"
                  label="Email"
                  value={value}
                  onChangeText={(valueText: string) => handleChange(valueText, onChange)}
                  textContentType="emailAddress"
                  autoComplete="email"
                  keyboardType="email-address"
                  autoCorrect={false}
                  style={styles.textField}
                  inputTestID="email-input"
                  refCallback={ref}
                  onBlur={onBlur}
                  errorMessage={errors.email && 'Please enter an email.'}
                  authError={!!errorMessage}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              defaultValue=""
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <TextField
                  label="Password"
                  value={value}
                  onChangeText={(valueText: string) => handleChange(valueText, onChange)}
                  secureTextEntry={true}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textContentType="password"
                  autoComplete="password"
                  style={styles.textField}
                  inputTestID="password-input"
                  onBlur={onBlur}
                  refCallback={ref}
                  errorMessage={errors.password && 'Please enter a password.'}
                  authError={!!errorMessage}
                />
              )}
            />
            {errorMessage && !signingIn && <ErrorMessage error={errorMessage} theme={theme} />}
            <Button
              accessibilityLabel="Sign in"
              disabled={signingIn}
              onPress={handleSubmit(signIn)}
              title={signingIn ? 'Signing in...' : 'Sign in'}
              testID="sign-in-button"
            />
            <LegalMessage />
          </View>
          <SwipeModal />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const createStyleSheet = (height: number, os: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    screenContainer: {
      display: 'flex',
      flex: 1,
      height: os === 'IOS' ? '100%' : height - 45,
      flexDirection: 'column',
    },
    wrapper: {
      padding: 20,
      flex: 1,
    },
    textField: {
      marginBottom: 40,
    },
    title: {
      marginBottom: 20,
      marginTop: 20,
      fontSize: 26,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    fixedWidthOnTablet: {
      width: 350,
      alignSelf: 'center',
    },
  });
