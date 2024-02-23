/* eslint-disable react-hooks/rules-of-hooks */
import React, { createRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Theme, useTheme } from '~/designSystem/themes';
import { Footer } from './components/Footer';
import Text from '~/designSystem/Text';
import RBSheet from 'react-native-raw-bottom-sheet';
import Actionsheet from '~/designSystem/Actionsheet';

export default function swipeModal() {
  const theme = useTheme();
  const { dark } = useTheme();
  const styles = createStyleSheet(theme);
  const sheetRef = createRef<RBSheet>();

  const image = dark
    ? require('../../assets/illustrations/CrossWhite.png')
    : require('../../assets/illustrations/cross.png');

  return (
    <>
      <Footer onPressFooter={() => sheetRef.current?.open()} />
      <Actionsheet
        ref={sheetRef}
        height={300}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: 'center',
            alignItems: 'center',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: dark ? 'black' : 'white',
          },
        }}>
        <View style={styles.view}>
          <Text color="text" style={styles.text}>
            Simply reset your password on our website using your Google or Facebook email address.
          </Text>
          <Text color="text" style={styles.text}>
            Set a new password, then use your new details to sign in to the app.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => sheetRef.current?.close()}
          style={styles.cross}
          accessibilityLabel="Close"
          accessibilityHint="Press to close the modal">
          <Image style={styles.Image} source={image} resizeMode="contain" />
        </TouchableOpacity>
      </Actionsheet>
    </>
  );
}

const createStyleSheet = ({ dark }: Theme) =>
  StyleSheet.create({
    view: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 20,
    },
    text: {
      fontWeight: '500',
      color: dark ? 'white' : 'black',
      fontSize: 16,
      textAlign: 'center',
      margin: 10,
      maxWidth: 280,
    },
    cross: {
      height: 48,
      width: 48,
      position: 'absolute',
      top: 10,
      right: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    Image: {
      height: 48,
      width: 48,
    },
  });
