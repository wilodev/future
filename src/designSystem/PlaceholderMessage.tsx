import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Text from './Text';

export type PlaceholderMessageProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function PlaceholderMessage({ children, style }: PlaceholderMessageProps) {
  return (
    <View style={[styles.message, style]}>
      <Text>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
});
