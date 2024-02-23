import React, { useContext } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { AuthenticationTokenContext } from '~/utils/AuthenticationTokenContext';

export default function NotEligibleScreen() {
  const theme = useTheme();
  const styles = createStyleSheet(theme);
  const { discardToken } = useContext(AuthenticationTokenContext);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.ImageView}>
          <Image
            testID="image-view"
            source={require('../../assets/noteligible.png')}
            style={styles.ImageStyle}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textBlock}>
          <Text size="xlarge" weight="bold">
            Oops!
          </Text>

          <Text style={styles.text2}>
            This feature isn’t available to everyone right now, but look out for an invite in the
            future.
          </Text>

          <Text style={styles.text2}>Head to the FutureLearn website to continue learning!</Text>
        </View>
      </ScrollView>

      <Button
        accessibilityLabel="Okay"
        onPress={discardToken}
        title={'Okay'}
        testID="Okay-in-button"
        style={styles.Button}
      />
    </SafeAreaView>
  );
}

const createStyleSheet = ({}: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    ImageView: {
      marginTop: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ImageStyle: {
      height: 200,
      width: '80%',
    },
    textBlock: {
      margin: 20,
    },
    text: {
      fontSize: 28,
      fontWeight: '700',
      marginVertical: 20,
    },
    text2: {
      fontSize: 22,
      fontWeight: '400',
      marginVertical: 20,
    },
    Button: {
      width: '90%',
      position: 'absolute',
      bottom: 50,
      alignSelf: 'center',
    },
  });
