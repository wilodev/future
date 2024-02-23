import React, { useState, useContext, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Config from 'react-native-config';

import { AuthenticationTokenContext } from '~/utils/AuthenticationTokenContext';
import ActivityIndicator from '~/designSystem/ActivityIndicator';
import IconButton from '~/designSystem/IconButton';
import useAsyncFetch from '~/utils/useAsyncFetch';
import useFooterHeight, {
  FOOTER_CONTENT_HEIGHT,
  FOOTER_VERTICAL_PADDING,
} from '~/utils/useFooterHeight';

export default function WebViewScreen({
  route: {
    params: { uri },
  },
}: {
  route: { params: { uri: string } };
}) {
  const { tokenPromise } = useContext(AuthenticationTokenContext);
  const { data: webViewToken } = useAsyncFetch(() => tokenPromise, [tokenPromise]);

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const styles = createStyles(useFooterHeight());

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const goForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const basicAuthCredentials =
    Config.STAGING_USERNAME && Config.STAGING_PASSWORD
      ? {
          username: Config.STAGING_USERNAME,
          password: Config.STAGING_PASSWORD,
        }
      : undefined;

  return webViewToken ? (
    <>
      <WebView
        allowsFullscreenVideo
        ref={webViewRef}
        onNavigationStateChange={(state: WebViewNavigation) => {
          setCanGoBack(state.canGoBack);
          setCanGoForward(state.canGoForward);
        }}
        source={{
          uri,
          method: 'GET',
          headers: {
            'x-futurelearn-authorization': `Bearer ${webViewToken}`,
            'x-futurelearn-csrfp': '1',
            'x-futurelearn-client': 'mobile-app',
          },
        }}
        testID="web-view"
        style={styles.webviewOpacity}
        basicAuthCredential={basicAuthCredentials}
      />
      <View style={styles.footerContainer}>
        <View style={styles.footerBar}>
          <IconButton
            disabled={!canGoBack}
            accessibilityLabel="Back"
            onPress={goBack}
            source={require('~/assets/chevron-left.png')}
            style={styles.button}
            testID="back-button"
          />
          <IconButton
            disabled={!canGoForward}
            accessibilityLabel="Forward"
            onPress={goForward}
            source={require('~/assets/chevron-right.png')}
            style={styles.button}
            testID="forward-button"
          />
        </View>
      </View>
    </>
  ) : (
    <ActivityIndicator />
  );
}

const createStyles = (footerHeight: number) =>
  StyleSheet.create({
    footerContainer: {
      height: footerHeight,
    },
    footerBar: {
      alignItems: 'center',
      flexDirection: 'row',
      height: FOOTER_CONTENT_HEIGHT,
      marginTop: FOOTER_VERTICAL_PADDING,
      paddingHorizontal: 16,
    },
    button: {
      marginStart: 8,
      marginEnd: 20,
    },
    webviewOpacity: {
      opacity: 0.99,
    },
  });
