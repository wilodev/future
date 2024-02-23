import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, act } from '@testing-library/react-native';

import { RootNavigationProp, RootRouteProp } from '~/navigators/RootNavigationStack';

import ToDoListScreen from '.';
import { StepsQuery, StepsDocument } from './StepsQuery.generated';
import { StepProgressesDocument, StepProgressesQuery } from './StepProgressessQuery.generated';
import { ToDoListActivity, ToDoListStep } from './components/ToDoList';

const mockTrackEvent = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));

describe('ToDoListScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  const runId = '456';

  const enrolmentId = 'enrolment-1';

  const stepData: ToDoListStep = {
    id: 'step-1',
    itemType: 'Step',
    number: '1.1',
    title: 'Wrong road running',
    shortStepTypeLabel: 'step-type-label',
    contentType: 'Article',
  };

  const activityData: ToDoListActivity = {
    id: 'activity-1',
    itemType: 'Activity',
    title: 'Activity title',
    shortDescription: 'Activity short description',
  };

  const buildStepProgressesResponse = (
    withCompletedStep = false,
  ): MockedResponse<StepProgressesQuery> => ({
    request: {
      query: StepProgressesDocument,
      variables: {
        enrolmentId,
      },
    },
    result: {
      data: {
        courseEnrolment: {
          id: enrolmentId,
          stepProgresses: [
            {
              lastCompletedAt: withCompletedStep ? '2022-03-22T14:05:10Z' : null,
              step: {
                id: 'step-1',
              },
            },
            {
              lastCompletedAt: null,
              step: {
                id: 'step-2',
              },
            },
          ],
        },
      },
    },
  });

  const buildStepsResponse = (step = stepData): MockedResponse<StepsQuery> => ({
    request: {
      query: StepsDocument,
      variables: { runId },
    },
    result: {
      data: {
        run: {
          id: runId,
          weeks: [
            {
              id: '123',
              number: 1,
              title: 'First week title',
              activities: [
                {
                  ...activityData,
                  imageUrl: null,
                  steps: [step],
                },
              ],
            },
          ],
        },
      },
    },
  });

  const runAllTimers = () => act(() => jest.runAllTimers());

  const setup = (
    stepsQueryResponse = buildStepsResponse(),
    stepProgressesQueryResponse = buildStepProgressesResponse(),
  ) => {
    const navigateFn = jest.fn();
    const navigation = { navigate: navigateFn, goBack: jest.fn() } as Partial<
      RootNavigationProp<'ToDoList'>
    > as RootNavigationProp<'ToDoList'>;

    const route = { params: { runId, enrolmentId } } as RootRouteProp<'ToDoList'>;

    const renderScreen = () =>
      render(
        <MockedProvider mocks={[stepsQueryResponse, stepProgressesQueryResponse]}>
          <ToDoListScreen navigation={navigation} route={route} />
        </MockedProvider>,
      );

    return { renderScreen, navigateFn };
  };

  describe('when the steps and activities are loading', () => {
    it('renders a loading message', () => {
      const { queryByTestId } = setup().renderScreen();

      expect(queryByTestId('loading-indicator')).toBeTruthy();

      runAllTimers();

      expect(queryByTestId('loading-indicator')).toBeTruthy();
    });
  });

  describe('when the steps and activities have loaded', () => {
    it('renders the activities', () => {
      const { queryByText } = setup().renderScreen();

      runAllTimers();

      expect(queryByText(activityData.title)).toBeDefined();
    });

    describe('when there are no completed steps', () => {
      it('does not render any marked as complete icons', () => {
        const { queryByA11yHint } = setup().renderScreen();

        runAllTimers();

        expect(queryByA11yHint('Marked as complete')).toBeFalsy();
      });
    });

    describe('when there are completed steps', () => {
      it('renders the marked as complete icons', () => {
        const { queryByA11yHint } = setup(
          buildStepsResponse(),
          buildStepProgressesResponse(true),
        ).renderScreen();

        runAllTimers();

        expect(queryByA11yHint('Marked as complete')).toBeDefined();
      });
    });
  });

  describe('when there is an error', () => {
    it('renders an error message', () => {
      const { findByText } = setup({
        request: {
          query: StepsDocument,
        },
        error: new Error('Sample error'),
      }).renderScreen();

      runAllTimers();

      expect(findByText('Something went wrong')).toBeTruthy();
    });
  });
});
