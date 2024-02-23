import React, { ReactNode, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  ImageSourcePropType,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '~/designSystem/Button';
import Text from '~/designSystem/Text';
import { Theme, useTheme } from '~/designSystem/themes';
import { useApp } from '~/hooks/AppProvider';

export default function WelcomeScreen() {
  const theme = useTheme();
  const styles = createStyleSheet(theme);
  const [state, setState] = useState(false);
  const { setWelcome } = useApp();

  function onpressButtonNext(): any {
    setState(true);
  }

  const statrtLearning = async () => {
    try {
      await AsyncStorage.setItem('welcome', 'enter');
      setWelcome('enter');
    } catch (e) {
      // saving error
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {!state ? (
          <WelcomeView
            Image={require('../../assets/welcome1.png')}
            Text1={'Welcome to FutureLearn'}
            Text2={
              'You’ve unlocked your learning App! Here you can view your courses and learn on the go'
            }
            style={styles.activeDot}
            style1={styles.nonActiveDot}
          />
        ) : (
          <WelcomeView
            Image={require('../../assets/welcome2.png')}
            Text1={'Track your progress'}
            Text2={'Track your learning progress, and set personal learning reminders'}
            style={styles.nonActiveDot}
            style1={styles.activeDot}
          />
        )}
      </ScrollView>
      {!state ? (
        <Button
          accessibilityLabel="Next"
          onPress={onpressButtonNext}
          title={'Next'}
          testID="Next-Welcome"
          style={styles.Button}
        />
      ) : (
        <Button
          accessibilityLabel="Start learning"
          onPress={statrtLearning}
          title={'Start learning'}
          testID="Startlearning"
          style={styles.Button}
        />
      )}
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
      height: 300,
      width: '80%',
    },
    textBlock: {
      margin: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 28,
      fontWeight: '700',
      marginVertical: 20,
    },
    text2: {
      fontSize: 22,
      fontWeight: '400',
      marginVertical: 10,
      textAlign: 'center',
      lineHeight: 34,
    },
    Button: {
      width: '90%',
      position: 'absolute',
      bottom: 50,
      alignSelf: 'center',
    },
    dotAlign: {
      alignSelf: 'center',
      flexDirection: 'row',
    },
    activeDot: {
      width: 10,
      height: 10,
      borderRadius: 10,
      backgroundColor: '#DE00A5',
      marginHorizontal: 5,
    },
    nonActiveDot: {
      width: 10,
      height: 10,
      borderRadius: 10,
      backgroundColor: '#CACACC',
      marginHorizontal: 5,
    },
    text2height: {
      height: 150,
    },
  });

const WelcomeView = (props: {
  style1: StyleProp<ViewStyle>;
  style: StyleProp<ViewStyle>;
  Text1: ReactNode;
  Text2: ReactNode;
  Image: ImageSourcePropType;
}) => {
  const theme = useTheme();
  const styles = createStyleSheet(theme);

  return (
    <>
      <View style={styles.ImageView}>
        <Image
          testID="image-view"
          source={props.Image}
          style={styles.ImageStyle}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textBlock}>
        <Text size="xlarge" weight="bold">
          {props.Text1}
        </Text>

        <View style={styles.text2height}>
          <Text style={styles.text2}>{props.Text2}</Text>
        </View>
      </View>

      <View style={styles.dotAlign}>
        <View style={props.style} />
        <View style={props.style1} />
      </View>
    </>
  );
};
