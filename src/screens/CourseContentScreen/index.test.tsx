import React from 'react';
import {
  //fireEvent,
  render,
} from '@testing-library/react-native';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { RouteProp } from '@react-navigation/core';

import { RootNavigationParamList, RootNavigationProp } from '~/navigators/RootNavigationStack';
//import { waitForPromises } from '~/utils/TestUtils';

import CourseContentScreen from '.';
import { AllStepsDocument, AllStepsQuery } from './AllStepsQuery.generated';
import { StepContentDocument, StepContentQuery } from './StepContentQuery.generated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '~/hooks/AppProvider';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: jest.fn(() => ({ height: 100, width: 100 })),
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useIsFocused: () => false,
  };
});

const mockTrackEvent = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));

describe('CourseContentScreen', () => {
  const enrolmentId = 'enrolment-id';
  const RUN_ID = '456';
  const STEP_ID = '567';
  const STEP_ID2 = '967';
  const ACTIVITY_ID = '1234';
  const ACTIVITY_ID2 = '2234';

  const stepBase = { contentType: 'Article', mobileSsoUrl: 'https://www.example.com/step' };

  const SUCCESS_RESPONSE: Partial<MockedResponse<AllStepsQuery>> = {
    result: {
      data: {
        courseEnrolment: {
          id: enrolmentId,
          run: {
            id: RUN_ID,
            weeks: [
              {
                id: '123',
                activities: [
                  {
                    id: ACTIVITY_ID,
                    title: 'Activity 1 title',
                    shortDescription:
                      'I am some random long text and I am really not sure what am I doing here',
                    imageUrl: null,
                    steps: [{ ...stepBase, id: STEP_ID, number: '1.1', title: 'Step 1 title' }],
                  },
                  {
                    id: ACTIVITY_ID2,
                    title: 'Activity 2 title',
                    shortDescription:
                      'I am some random long text and I am really not sure what am I doing here',
                    imageUrl: 'https://example.com/activity2.png',
                    steps: [
                      { ...stepBase, id: STEP_ID2, number: '2.1', title: 'Step 1 title' },
                      { ...stepBase, id: '568', number: '2.2', title: 'Step 2 title' },
                      { ...stepBase, id: '569', number: '2.3', title: 'Step 3 title' },
                    ],
                  },
                ],
              },
            ],
          },
          stepProgresses: [],
        },
      },
    },
  };

  const setup = (allStepsResponse = SUCCESS_RESPONSE) => {
    const setParamsFn = jest.fn();
    const navigateFn = jest.fn();
    const navigation = {
      setParams: setParamsFn,
      navigate: navigateFn,
    } as Partial<RootNavigationProp<'CourseContent'>> as RootNavigationProp<'CourseContent'>;
    const routeProps = {
      params: {
        enrolmentId,
        runId: RUN_ID,
        currentItem: { id: ACTIVITY_ID, itemType: 'Activity' },
      },
    } as RouteProp<RootNavigationParamList, 'CourseContent'>;

    const allStepsMock: MockedResponse<AllStepsQuery> = {
      request: {
        query: AllStepsDocument,
        variables: { enrolmentId },
      },
      ...allStepsResponse,
    };

    const stepContentMock: MockedResponse<StepContentQuery> = {
      request: { query: StepContentDocument, variables: { stepId: STEP_ID } },
      result: {
        data: {
          contentByStepId: {
            __typename: 'Article',
            id: '1234',
            bodyForMobileApp: 'Step 1 content',
            copyrightForMobileApp: '<p>A copyright notice</p>',
          },
        },
      },
    };

    const renderScreen = () =>
      render(
        <MockedProvider mocks={[allStepsMock, stepContentMock]}>
          <AppProvider>
            <SafeAreaProvider>
              <CourseContentScreen navigation={navigation} route={routeProps} />
            </SafeAreaProvider>
          </AppProvider>
        </MockedProvider>,
      );

    return { renderScreen, setParamsFn, navigateFn };
  };

  // describe('when the carousel is rendered', () => {
  //   it('renders the activity in the carousel', async () => {
  //     const { findByText } = setup().renderScreen();

  //     expect(await findByText('Activity 1 title')).toBeTruthy();
  //   });
  // });

  describe('when there is an error', () => {
    it('renders an error message', async () => {
      const { findAllByText } = setup({
        error: new Error('Sample error'),
      }).renderScreen();

      expect(await findAllByText('Something went wrong')).toBeTruthy();
    });
  });

  // describe('when the steps carousel is swiped', () => {
  //   it('calls the navigation setOptions callback', async () => {
  //     const eventData = {
  //       nativeEvent: {
  //         contentSize: { height: 600, width: 400 },
  //         contentOffset: { x: 100, y: 0 },
  //         layoutMeasurement: { height: 100, width: 100 },
  //       },
  //     };
  //     const { renderScreen, setParamsFn } = setup();

  //     const { getByTestId, findAllByText } = renderScreen();
  //     await findAllByText('Activity');

  //     fireEvent.scroll(getByTestId('course-carousel'), eventData);

  //     expect(mockTrackEvent).toHaveBeenCalledWith('View step', 'Course', {
  //       source: 'Swipe',
  //       step_id: '567',
  //       run_id: '456',
  //       step_type: 'Article',
  //     });
  //     expect(setParamsFn).toHaveBeenCalledWith({
  //       currentItem: expect.objectContaining({
  //         id: STEP_ID,
  //         itemType: 'Step',
  //       }),
  //       animateOnIndexChange: true,
  //     });

  //     await waitForPromises();
  //   });

  //   it('calls the Activity navigation', async () => {
  //     const eventData = {
  //       nativeEvent: {
  //         contentSize: { height: 600, width: 400 },
  //         contentOffset: { x: 190, y: 0 },
  //         layoutMeasurement: { height: 100, width: 100 },
  //       },
  //     };
  //     const { renderScreen, setParamsFn } = setup();
  //     const { getByTestId, findByText } = renderScreen();

  //     await findByText('Activity 1 title');

  //     fireEvent.scroll(getByTestId('course-carousel'), eventData);

  //     expect(mockTrackEvent).toHaveBeenCalledWith('View activity', 'Course', {
  //       activity_id: '2234',
  //       source: 'Swipe',
  //       run_id: '456',
  //     });
  //     expect(setParamsFn).toHaveBeenCalledWith({
  //       currentItem: expect.objectContaining({
  //         id: '2234',
  //         itemType: 'Activity',
  //       }),
  //       animateOnIndexChange: true,
  //     });

  //     await waitForPromises();
  //   });
  // });

  // describe('when ToDo list button is tapped', () => {
  //   it('calls the navigation navigate callback', async () => {
  //     const { renderScreen, navigateFn } = setup();

  //     const { getByTestId, findByText } = renderScreen();

  //     await findByText('Activity 1 title');

  //     fireEvent.press(getByTestId('to-do-icon'));

  //     expect(mockTrackEvent).toHaveBeenCalledWith('Open Todo List', 'Course', { run_id: RUN_ID });
  //     expect(navigateFn).toBeCalledWith('ToDoList', {
  //       currentItem: expect.objectContaining({ id: ACTIVITY_ID, itemType: 'Activity' }),
  //       runId: RUN_ID,
  //       enrolmentId,
  //     });
  //   });
  // });
});
