import React from 'react';
import { StyleSheet } from 'react-native';

import IconButton, { IconButtonProps } from '~/designSystem/IconButton';

export default function ToDoButton(pressableProps: Omit<IconButtonProps, 'source'>) {
  return (
    <IconButton
      accessibilityLabel="To do list"
      source={require('~/assets/todo-list.png')}
      iconStyle={styles.icon}
      testID="to-do-icon"
      style={styles.button}
      {...pressableProps}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 20,
  },
  icon: {
    height: 28,
    width: 28,
  },
});
