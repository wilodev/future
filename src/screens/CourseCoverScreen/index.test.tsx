import React from 'react';
import { act, render } from '@testing-library/react-native';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { NavigationContext, RouteProp } from '@react-navigation/native';

import { RootNavigationParamList, RootNavigationProp } from '~/navigators/RootNavigationStack';
import { formatLongDate, formatShortTime } from '~/utils/dateFormatting';
import { asPercentForDisplay } from '~/utils/numberFormatting';
import { setupMockNavigationProp } from '~/utils/TestUtils';

import CourseCoverScreen from '.';
import { CourseEnrolmentDocument, CourseEnrolmentQuery } from './CourseEnrolmentQuery.generated';

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useIsFocused: () => false,
  };
});

describe('CourseCoverScreen', () => {
  const enrolmentId = 'enrolment-id';

  const buildMockResponse = (
    courseEnrolment: CourseEnrolmentQuery['courseEnrolment'] = mockCourseEnrolmentData,
  ): MockedResponse<CourseEnrolmentQuery> => ({
    request: {
      query: CourseEnrolmentDocument,
      variables: { enrolmentId },
    },
    result: {
      data: {
        courseEnrolment,
      },
    },
  });

  const mockStepData = {
    id: 'step-id',
    number: '1.1',
    title: 'Step Title',
    contentType: 'Article',
    shortStepTypeLabel: 'Article',
  };

  const mockRunData = {
    id: 'run-id',
    fullTitle: 'Innovation: the Fashion Industry',
    organisation: {
      id: 'organisation-id',
      title: 'University of Leeds',
    },
    firstStep: mockStepData,
    canParticipate: true,
    imageAlt: 'Man on a horse with a duck',
    imageUrl: 'https://www.example.com/horse-man-duck.jpeg',
    isStarted: true,
    startTime: new Date(2011, 8, 1, 10, 22, 50).toISOString(),
  };

  const mockCourseEnrolmentData = {
    id: enrolmentId,
    run: mockRunData,
    lastStepVisit: null,
    accessIsExpired: false,
    accessExpiryTime: null,
    stepsCompletedRatio: 0.754321,
  };

  const setup = (mockResponse = buildMockResponse()) => {
    jest.useFakeTimers();

    const { blur, focus, navigationProp } =
      setupMockNavigationProp<RootNavigationProp<'CourseCover'>>();

    const route = {
      params: { enrolmentId },
    } as RouteProp<RootNavigationParamList, 'CourseCover'>;

    const renderScreen = () =>
      render(
        <MockedProvider mocks={[mockResponse]}>
          <NavigationContext.Provider value={navigationProp}>
            <CourseCoverScreen navigation={navigationProp} route={route} />
          </NavigationContext.Provider>
        </MockedProvider>,
      );

    return { renderScreen, blur, focus, navigationProp };
  };

  const runAllTimers = () =>
    act(() => {
      jest.runAllTimers();
    });

  it('renders a loading indicator while loading', () => {
    const { queryByTestId } = setup().renderScreen();

    expect(queryByTestId('loading-indicator')).toBeTruthy();

    runAllTimers();
  });

  describe('when there is an error', () => {
    it('renders an error message', () => {
      const { queryByHintText } = setup({
        request: {
          query: CourseEnrolmentDocument,
        },
        error: new Error('Sample error'),
      }).renderScreen();

      runAllTimers();

      expect(queryByHintText('Something went wrong')).toBeDefined();
    });
  });

  describe('once the enrolment data has been successfully retrieved', () => {
    it('renders the course details', () => {
      const { queryByHintText } = setup().renderScreen();

      runAllTimers();

      expect(queryByHintText('Innovation: the Fashion Industry')).toBeDefined();
    });

    it('renders the to do list button', () => {
      const { renderScreen, navigationProp } = setup();

      renderScreen();

      runAllTimers();

      expect(navigationProp.setOptions).toHaveBeenCalledWith({
        headerRight: expect.any(Function),
      });
    });

    it('displays the course progress', () => {
      const { queryByLabelText } = setup().renderScreen();

      runAllTimers();

      const formattedPercentage = asPercentForDisplay(0.75, { maximumFractionDigits: 0 });

      expect(queryByLabelText(`${formattedPercentage} complete`)).toBeDefined();
    });
  });

  describe('when there is no last visited step', () => {
    it('includes a link to the first step in the course', () => {
      const mockResponse = buildMockResponse({
        ...mockCourseEnrolmentData,
        run: {
          ...mockRunData,
          firstStep: {
            ...mockStepData,
            id: 'first-step-id',
            title: 'Welcome to the course',
          },
        },
        lastStepVisit: null,
      });

      const { queryByHintText } = setup(mockResponse).renderScreen();

      runAllTimers();

      expect(queryByHintText('First step visited')).toBeDefined();
      expect(queryByHintText('Welcome to the course')).toBeDefined();
    });
  });

  describe('when there is a last visited step', () => {
    it('includes a link to the last visited step', () => {
      const mockResponse = buildMockResponse({
        ...mockCourseEnrolmentData,
        lastStepVisit: {
          id: 'step-visit-id',
          step: {
            ...mockStepData,
            id: 'last-visited-step-id',
            title: 'How to dress for lawn croquet',
          },
        },
      });

      const { queryByHintText } = setup(mockResponse).renderScreen();

      runAllTimers();

      expect(queryByHintText('Last step visited')).toBeDefined();
      expect(queryByHintText('How to dress for lawn croquet')).toBeDefined();
    });
  });

  describe('when the user is currently unable to participate', () => {
    it('does not render the to do button', () => {
      const mockResponse = buildMockResponse({
        ...mockCourseEnrolmentData,
        run: { ...mockRunData, canParticipate: false },
      });

      const { queryByTestId } = setup(mockResponse).renderScreen();

      runAllTimers();

      expect(queryByTestId('to-do-icon')).toBeNull();
    });
  });

  describe('access expiry', () => {
    const accessExpiryTime = new Date(2021, 9, 1, 10, 22, 50);

    describe("when the user's access has yet to expire", () => {
      it('does not display the access expired banner', () => {
        const mockResponse = buildMockResponse({
          ...mockCourseEnrolmentData,
          accessIsExpired: false,
          accessExpiryTime: accessExpiryTime.toISOString(),
        });

        const { queryByText } = setup(mockResponse).renderScreen();

        runAllTimers();

        expect(
          queryByText(`Your access to this course expired on ${formatLongDate(accessExpiryTime)}`),
        ).toBeNull();
      });
    });

    describe("when the user's access has expired", () => {
      it('displays the access expired banner', () => {
        const mockResponse = buildMockResponse({
          ...mockCourseEnrolmentData,
          accessIsExpired: true,
          accessExpiryTime: accessExpiryTime.toISOString(),
        });

        const { queryByHintText } = setup(mockResponse).renderScreen();

        runAllTimers();

        expect(
          queryByHintText(
            `Your access to this course expired on ${formatLongDate(accessExpiryTime)}`,
          ),
        ).toBeDefined();
      });
    });
  });

  describe('when course has yet to start', () => {
    const startTime = new Date(2022, 2, 1, 10, 22, 50);
    const mockResponse = buildMockResponse({
      ...mockCourseEnrolmentData,
      run: { ...mockRunData, isStarted: false, startTime: startTime.toISOString() },
    });

    it('displays a message with the local start date and time', () => {
      const { queryByHintText } = setup(mockResponse).renderScreen();

      runAllTimers();

      expect(
        queryByHintText(
          `This course starts on ${formatLongDate(startTime)} at ${formatShortTime(startTime)}`,
        ),
      ).toBeDefined();
    });

    it('does not display the course progress', () => {
      const { queryByHintText } = setup(mockResponse).renderScreen();

      runAllTimers();

      const formattedPercentage = asPercentForDisplay(0.75, { maximumFractionDigits: 0 });

      expect(queryByHintText(`${formattedPercentage} complete`)).toBeNull();
    });
  });

  it('refetches the enrolment data on focus', () => {
    let responseCounter = 0;

    const mockResponse = {
      ...buildMockResponse(),
      newData: () => ({
        data: {
          courseEnrolment: {
            ...mockCourseEnrolmentData,
            lastStepVisit: {
              id: 'step-visit-id',
              step: {
                ...mockStepData,
                title: `Last visited step ${++responseCounter}`,
              },
            },
          },
        },
      }),
    };

    const { blur, focus, renderScreen } = setup(mockResponse);

    const { queryByHintText } = renderScreen();

    runAllTimers();

    expect(queryByHintText('Last visited step 1')).toBeDefined();

    act(blur);

    runAllTimers();

    expect(queryByHintText('Last visited step 1')).toBeDefined();

    act(focus);

    runAllTimers();

    expect(queryByHintText('Last visited step 2')).toBeDefined();
  });
});
