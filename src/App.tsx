import '../prism-config.js';
import React, { useEffect } from 'react';
import 'intl';
import 'intl/locale-data/jsonp/en-GB';
import { StatusBar, useColorScheme } from 'react-native';
import { LaunchArguments } from 'react-native-launch-arguments';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import LottieSplashScreen from 'react-native-lottie-splash-screen';
import { RootSiblingParent } from 'react-native-root-siblings';

import { darkTheme, lightTheme } from './designSystem/themes';
import { withAuthenticationTokenContext } from './utils/AuthenticationTokenContext';
import { withApolloProvider } from './utils/apollo';
import { useAnalytics } from './utils/analytics';
import { withAppLaunchInfo } from './utils/AppLaunchInfoContext';
import { withMixpanel } from './utils/mixpanel';
import { trackForegroundNotificationEvents } from './utils/notifications';
import RootNavigationStack from './navigators/RootNavigationStack';
import { AppProvider } from './hooks/AppProvider';

const { authenticationToken } = LaunchArguments.value<{ authenticationToken?: string }>();

function App() {
  const colorScheme = useColorScheme();
  const { track } = useAnalytics();

  useEffect(() => {
    setTimeout(() => {
      LottieSplashScreen.hide();
    }, 1800);
  }, []);

  useEffect(() => trackForegroundNotificationEvents(track), [track]);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const backgroundColor = theme.colors.background;

  return (
    <SafeAreaProvider style={{ backgroundColor }}>
      <RootSiblingParent>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor}
        />
        <AppProvider>
          <NavigationContainer theme={theme}>
            <RootNavigationStack />
          </NavigationContainer>
        </AppProvider>
      </RootSiblingParent>
    </SafeAreaProvider>
  );
}

export default withMixpanel(
  withAuthenticationTokenContext(withApolloProvider(withAppLaunchInfo(App)), authenticationToken),
);
