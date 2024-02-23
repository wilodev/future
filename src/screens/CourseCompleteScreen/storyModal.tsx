/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Linking,
  Alert,
  Text,
} from 'react-native';
import { Theme, useTheme } from '~/designSystem/themes';
import { Data } from './mockData';
import { ScreenList } from './screens';
// import Button from '~/designSystem/Button';

const url = 'https://futurelearn.typeform.com/to/ItzTSUEF';

type StoryModalProps = {
  state: boolean;
  onPressHide: () => void;
  onClose: () => void;
};

export default function storyModal({ state, onPressHide, onClose }: StoryModalProps) {
  const height = Dimensions.get('window').height;
  const theme = useTheme();
  theme.dark = true;
  const styles = createStyleSheet(theme, height);
  const [list, setList] = useState(Data);
  const [count, setCount] = useState(0);
  const [currentItem, setCurrentItem] = useState(Data[0]);

  const onPressRight = () => {
    if (count < list.length - 1) {
      const current = list[count + 1];
      const newState = list.map(obj => {
        if (obj.id === count + 1) {
          return { ...obj, view: true };
        }
        return obj;
      });
      setList(newState);
      setCount(count + 1);
      setCurrentItem(current);
    } else {
      // Press Button to Hide
      onClose();
    }
  };

  const onPressLeft = () => {
    if (count >= 1) {
      const current = list[count - 1];
      const newState = list.map(obj => {
        if (obj.id === count) {
          return { ...obj, view: false };
        }
        return obj;
      });
      setList(newState);
      setCount(count - 1);
      setCurrentItem(current);
    } else {
      // Press Button to Hide
      onClose();
    }
  };

  const onPressSurvey = useCallback(async () => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={state}
      onRequestClose={() => {
        onPressHide();
      }}>
      {ScreenList[count] &&
        React.createElement(ScreenList[count].component, {
          data: currentItem,
          handleCloseScreen: onClose,
          footerAction: () => {},
          header: (
            <View style={styles.barContainer}>
              {list.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={[
                      styles.progressBar,
                      { backgroundColor: item.view ? '#DE00A5' : '#FFFFFF' },
                    ]}
                  />
                );
              })}
            </View>
          ),
        })}

      <TouchableOpacity onPress={onPressLeft} style={styles.sensor} />
      <TouchableOpacity onPress={onPressRight} style={[styles.sensor, { right: 0 }]} />
      <View style={styles.bottom}>
        {count === list.length - 1 ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={onPressSurvey}
            style={{
              height: 50,
              width: 250,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
            <Text style={styles.textRate}>Leave feedback</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Modal>
  );
}

const createStyleSheet = ({ colors }: Theme, height: number) =>
  StyleSheet.create({
    barContainer: {
      flexDirection: 'row',
      paddingTop: 42,
      paddingHorizontal: 10,
      position: 'relative',
    },
    progressBar: {
      height: 2,
      flex: 1,
      marginHorizontal: 2,
      flexDirection: 'row',
    },
    sensor: {
      position: 'absolute',
      height: height * 0.8,
      width: '50%',
      bottom: 0,
    },
    bottom: {
      width: '100%',
      position: 'absolute',
      bottom: '30%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      width: 358,
      maxWidth: 358,
      height: 44,
      paddingHorizontal: 24,
      paddingVertical: 10,
      backgroundColor: colors.staticPink500,
    },
    textRate: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.white,
      lineHeight: 34,
      textDecorationLine: 'underline',
    },
  });
