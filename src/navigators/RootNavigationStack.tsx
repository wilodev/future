/* eslint-disable react/no-unstable-nested-components */
import React, { useContext, useEffect } from 'react';
import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationOptions,
  TransitionPresets,
} from '@react-navigation/stack';
import { StyleSheet, Platform, View } from 'react-native';
import { Theme, useTheme } from '~/designSystem/themes';
import SignInScreen from '~/screens/SignInScreen';
import ToDoListScreen, { ToDoListItemKey } from '~/screens/ToDoListScreen';
import {
  AuthenticationTokenContext,
  AuthenticationTokenStatus,
} from '~/utils/AuthenticationTokenContext';

import { toDoButtonHeader, useModalOptions } from './utils';
import { isIOS } from '~/utils/platform';
import WebViewScreen from '~/screens/WebViewScreen';
import LearningRemindersPermissionRequiredScreen from '~/screens/LearningRemindersPermissionRequiredScreen';
import HeaderBackButton from '~/screens/LearningRemindersSettingsScreen/navigation/HeaderBackButton';
import HeaderDoneButton from '~/screens/LearningRemindersSettingsScreen/navigation/HeaderDoneButton';
import LearningRemindersSettingsScreen from '~/screens/LearningRemindersSettingsScreen';
import useLargeDevice from '~/utils/useLargeDevice';
import { RemindersData } from '~/utils/notifications';
import LearningRemindersPromptScreen from '~/screens/LearningRemindersPromptScreen';
import LearningRemindersSuccessScreen from '~/screens/LearningRemindersSuccessScreen';
import CloseButton from '~/components/CloseButton';
import NotEligibleScreen from '~/screens/NotEligibleScreen';
import LoadingScreen from '~/screens/Loader';
import WelcomeScreen from '~/screens/WelcomeScreen';

import { useYourCoursesQuery } from '~/screens/YourCoursesScreen/YourCoursesQuery.generated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CourseContentScreen, { CourseContentItemKey } from '~/screens/CourseContentScreen';
import CourseCompleteScreen from '~/screens/CourseCompleteScreen';
import YourCoursesScreen from '~/screens/YourCoursesScreen';
import AccountScreen from '~/screens/AccountScreen';
import CourseCoverScreen from '~/screens/CourseCoverScreen';
import { useAnalytics } from '~/utils/analytics';
import { BlurView } from '@react-native-community/blur';
import HeaderTitle from '~/screens/YourCoursesScreen/components/HeaderTitle';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AccountButton from '~/screens/YourCoursesScreen/components/AccountButton';
import { useApp } from '~/hooks/AppProvider';
import JailMonkey from 'jail-monkey';
import Text from '~/designSystem/Text';

export type RootNavigationParamList = {
  SignIn: undefined;
  Loading: undefined;
  WelcomeScreen: undefined;
  NotEligible: undefined;
  YourCourses: { headerTitleVisible?: boolean };
  Account: undefined;
  CourseCompleteScreen: undefined;
  CourseContent: {
    runId: string;
    currentItem: CourseContentItemKey;
    animateOnIndexChange: boolean;
    enrolmentId: string;
  };
  CourseCover: { runId: string; enrolmentId: string };
  ToDoList: {
    runId: string;
    currentItem?: ToDoListItemKey;
    enrolmentId: string;
  };
  WebView: { uri: string; title: string };
  LearningRemindersPermissionRequired: {
    depth: number;
  };
  LearningRemindersSettings: {
    depth?: number;
    asModal?: boolean;
    remindersData?: RemindersData;
  };
  LearningRemindersPrompt: undefined;
  LearningRemindersSuccess: {
    remindersData: RemindersData;
    depth: number;
  };
};

export type RootNavigationProp<RouteName extends keyof RootNavigationParamList> =
  NativeStackNavigationProp<RootNavigationParamList, RouteName>;

export type RootRouteProp<RouteName extends keyof RootNavigationParamList> = RouteProp<
  RootNavigationParamList,
  RouteName
>;

export type RootScreenProps<RouteName extends keyof RootNavigationParamList> = {
  navigation: RootNavigationProp<RouteName>;
  route: RootRouteProp<RouteName>;
};

const Stack = createStackNavigator<RootNavigationParamList>();

export default function RootNavigationStack() {
  const { tokenStatus } = useContext(AuthenticationTokenContext);

  const theme = useTheme();
  const styles = createStyleSheet(theme);
  const { colors, dark } = useTheme();
  const { track } = useAnalytics();

  const { isLargeDevice } = useLargeDevice();
  const { bottomSheetOrDialogOptions, fullScreenOrDialogOptions } = useModalOptions();
  const { welcome, setWelcome } = useApp();

  const modalOptions: StackNavigationOptions = {
    headerBackImage: () => null,
    headerBackTitleVisible: false,
    headerStatusBarHeight: 0,
    headerTitleAlign: 'center',
    ...(!isLargeDevice &&
      (isIOS()
        ? TransitionPresets.ModalPresentationIOS
        : TransitionPresets.RevealFromBottomAndroid)),
  };

  const { data } = useYourCoursesQuery({
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('welcome');
      if (value !== null) {
        setWelcome(value);
      }
    } catch (e) {
      // error reading value
    }
  };

  if (tokenStatus === AuthenticationTokenStatus.Unknown) {
    return null;
  }

  const isAuth = tokenStatus === AuthenticationTokenStatus.Present;
  const isActiveCourseEnrolments = data?.currentUser?.activeCourseEnrolments;
  const hasSubscriptions = data?.currentUser?.hasSubscriptions;

  if (JailMonkey.isJailBroken()) {
    // Alternative be haviour for jail-broken/rooted devices.
    return (
      <View style={styles.Rooted}>
        <Text
          accessibilityLabel="Staying secure is important to us."
          accessibilityRole="header"
          testID="errorHeaderJailBroken"
          size="large"
          style={styles.title}>
          Staying secure is important to us.
        </Text>
        <Text
          accessibilityLabel="This Application is not allowed to run in rooted devices"
          accessibilityRole="text"
          size="medium"
          testID="errorBodyJailBroken"
          style={styles.title2}>
          To protect our learners, our app only works on unmodified devices. You can try another
          device, or head over to our website.
        </Text>
      </View>
    );
  }
  return (
    <Stack.Navigator>
      {/* Begin Checkout */}
      {!isAuth && (
        <>
          {/* Begin Acl Navigation */}

          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{
              headerShown: false,
              animationTypeForReplace: 'pop',
            }}
          />
          {/* End Acl Navigation */}
        </>
      )}
      {isAuth && (
        <>
          {/* Begin checkout in course enrolments */}
          {!isActiveCourseEnrolments && (
            <Stack.Screen
              name="Loading"
              component={LoadingScreen}
              options={{ headerShown: false }}
            />
          )}
          {isActiveCourseEnrolments && isActiveCourseEnrolments.length === 0 && hasSubscriptions ? (
            <Stack.Screen
              name="NotEligible"
              component={NotEligibleScreen}
              options={{ headerShown: false }}
            />
          ) : isActiveCourseEnrolments &&
            isActiveCourseEnrolments.length >= 0 &&
            !hasSubscriptions ? (
            <Stack.Screen
              name="NotEligible"
              component={NotEligibleScreen}
              options={{ headerShown: false }}
            />
          ) : welcome !== 'enter' ? (
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Group
                screenOptions={{
                  headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowColor: 'transparent',
                  },
                  headerTintColor: colors.text,
                }}>
                <Stack.Screen
                  name="YourCourses"
                  component={YourCoursesScreen}
                  options={({ navigation: { navigate }, route: { params } }) => ({
                    headerShown: true,
                    headerTransparent: Platform.select({ ios: true }),
                    title: 'Courses',
                    headerBackground: Platform.select({
                      ios: () => (
                        <BlurView
                          blurType={dark ? 'dark' : 'light'}
                          blurAmount={30}
                          style={StyleSheet.absoluteFill}
                        />
                      ),
                    }),
                    headerRight: () => <AccountButton navigate={navigate} />,
                    headerTitle: () => (
                      <HeaderTitle headerTitleVisible={params?.headerTitleVisible} />
                    ),
                  })}
                />
                <Stack.Screen name="Account" component={AccountScreen} />
                <Stack.Screen
                  name="CourseCompleteScreen"
                  component={CourseCompleteScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="CourseContent"
                  component={CourseContentScreen}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="CourseCover"
                  component={CourseCoverScreen}
                  options={({
                    route: {
                      params: { runId, enrolmentId },
                    },
                    navigation,
                  }) => ({
                    title: '',
                    headerRight: toDoButtonHeader({ navigation, runId, track, enrolmentId }),
                    headerRightContainerStyle: { display: 'none' },
                  })}
                />
              </Stack.Group>
              <Stack.Group screenOptions={{ presentation: 'modal' }}>
                <Stack.Screen
                  name="ToDoList"
                  component={ToDoListScreen}
                  options={({ navigation }) => ({
                    title: 'To do',
                    headerStyle: styles.toDoListHeader,
                    ...fullScreenOrDialogOptions,
                    ...modalOptions,
                    headerBackAccessibilityLabel: 'Close To do',
                    headerRight: () => <CloseButton navigation={navigation} />,
                  })}
                />
                <Stack.Screen
                  name="WebView"
                  component={WebViewScreen}
                  options={({
                    route: {
                      params: { title },
                    },
                    navigation,
                  }) => ({
                    title,
                    headerStyle: styles.webViewHeader,
                    ...modalOptions,
                    headerBackAccessibilityLabel: 'Close Webview',
                    headerRight: () => <CloseButton navigation={navigation} />,
                  })}
                />
                <Stack.Screen
                  name="LearningRemindersPermissionRequired"
                  component={LearningRemindersPermissionRequiredScreen}
                  options={{
                    gestureEnabled: false,
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="LearningRemindersPrompt"
                  component={LearningRemindersPromptScreen}
                  options={bottomSheetOrDialogOptions}
                />
                <Stack.Screen
                  name="LearningRemindersSettings"
                  component={LearningRemindersSettingsScreen}
                  options={props => ({
                    title: 'Learning reminders',
                    headerTitleAlign: 'center',
                    headerStyle: styles.learningRemindersHeader,
                    headerLeft: () => <HeaderBackButton {...props} />,
                    headerRight: () => <HeaderDoneButton {...props} />,
                    ...(props.route.params.asModal
                      ? TransitionPresets.ModalTransition
                      : TransitionPresets.DefaultTransition),
                  })}
                />
                <Stack.Screen
                  name="LearningRemindersSuccess"
                  component={LearningRemindersSuccessScreen}
                  options={{
                    gestureEnabled: false,
                    headerShown: false,
                  }}
                />
              </Stack.Group>
            </>
          )}
          {/* End checkout in course enrolments */}
        </>
      )}
    </Stack.Navigator>
  );
}

const createStyleSheet = ({ colors }: Theme) =>
  StyleSheet.create({
    closeButton: {
      tintColor: colors.text,
      marginRight: Platform.select({ ios: 15 }),
    },
    toDoListHeader: {
      height: 80,
      backgroundColor: colors.backgroundAlt,
    },
    webViewHeader: {
      backgroundColor: colors.backgroundAlt,
      elevation: 0,
      shadowColor: 'transparent',
    },
    learningRemindersHeader: {
      backgroundColor: colors.background,
      shadowOffset: Platform.select({
        ios: {
          width: 0,
          height: 0,
        },
      }),
    },
    Rooted: {
      flex: 1,
      justifyContent: 'center',
      // alignItems: 'center',
      margin: 20,
    },
    title: {
      marginTop: 20,
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 34,
    },
    title2: {
      marginBottom: 20,
      marginTop: 20,
      fontSize: 12,
      fontWeight: '500',
    },
  });
