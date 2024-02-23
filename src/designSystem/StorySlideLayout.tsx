import React from 'react';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewProps,
  TouchableOpacity,
} from 'react-native';
import { Theme, useTheme } from './themes';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from './Icon';

type StorySlideLayoutProps = ViewProps & {
  backgroundImage: ImageSourcePropType;
  children: React.ReactNode;
  footer: React.ReactNode;
  hasHeader?: boolean;
  header?: React.ReactNode;
  handleCloseAction?: () => void;
};

export default function StorySlideLayout({
  backgroundImage,
  children,
  footer,
  hasHeader = true,
  header,
  handleCloseAction,
}: StorySlideLayoutProps) {
  const theme = useTheme();
  const styles = createStyleSheet(theme, hasHeader);
  return (
    <View style={styles.screen}>
      <ImageBackground source={backgroundImage} style={styles.background}>
        <SafeAreaView style={styles.container}>
          {hasHeader && (
            <View style={styles.header}>
              {header && <View style={styles.headerTop}>{header}</View>}
              <View style={styles.headerFooter}>
                <Image
                  source={
                    theme.dark
                      ? require('~/assets/story-slides/logos/dark/futurelearn.png')
                      : require('~/assets/story-slides/logos/light/futurelearn.png')
                  }
                  style={styles.logo}
                />

                <TouchableOpacity style={styles.closeButton} onPress={handleCloseAction}>
                  <Icon
                    width={24}
                    height={24}
                    source={require('~/assets/story-slides/icons/cross.png')}
                    tintColor={theme.colors.staticPink500}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={styles.content}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const createStyleSheet = ({ colors }: Theme, hasHeader: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.backgroundStories,
      position: 'relative',
      width: '100%',
    },
    background: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    header: {
      flex: 0.12,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
    headerTop: {
      display: 'flex',
      width: '100%',
    },
    headerFooter: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
    },
    logo: {
      marginStart: 24,
    },
    closeButton: {
      height: 30,
      width: 30,
      marginRight: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: hasHeader ? 0.8 : 0.9,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 22,
      width: '100%',
    },
    footer: {
      flex: 0.12,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
