import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RootScreenProps } from '~/navigators/RootNavigationStack';

import { isIOS } from '~/utils/platform';
import IconButton from '~/designSystem/IconButton';
import Text from '~/designSystem/Text';
import { Spacing } from '~/designSystem/useSpacing';

export default function HeaderBackButton({
  navigation: { pop },
  route: {
    params: { depth },
  },
}: RootScreenProps<'LearningRemindersSettings'>) {
  const close = () => pop(depth);

  return (
    <View style={styles.container}>
      {isIOS() ? (
        <Pressable accessibilityRole="button" onPress={close}>
          <Text color="primary">Cancel</Text>
        </Pressable>
      ) : (
        <IconButton
          accessibilityLabel="Cancel"
          onPress={close}
          source={require('~/assets/cross.png')}
          testID="close-icon-button"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: Spacing.small,
  },
});
