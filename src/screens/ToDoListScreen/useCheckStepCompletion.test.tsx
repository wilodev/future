import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import useCheckStepCompletion from './useCheckStepCompletion';
import { StepProgressesDocument, StepProgressesQuery } from './StepProgressessQuery.generated';

describe('useCheckStepCompletion', () => {
  const enrolmentId = 'enrolment-1';
  const completedStepId = 'step-1';
  const uncompletedStepId = 'step-2';
  const unvisitedStepId = 'step-3';

  const setup = () => {
    const defaultResponse: MockedResponse<StepProgressesQuery> = {
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
                lastCompletedAt: '2022-03-22T14:05:10Z',
                step: {
                  id: completedStepId,
                },
              },
              {
                lastCompletedAt: null,
                step: {
                  id: uncompletedStepId,
                },
              },
            ],
          },
        },
      },
    };

    const { result, waitForNextUpdate } = renderHook(() => useCheckStepCompletion(enrolmentId), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MockedProvider mocks={[defaultResponse]}>{children}</MockedProvider>
      ),
    });

    return { result, waitForNextUpdate };
  };

  describe('when the step is marked as complete', () => {
    it('fetches the data and returns correct step progress', async () => {
      const { result, waitForNextUpdate } = setup();

      await waitForNextUpdate();

      expect(result.current?.stepIsComplete(completedStepId)).toBe(true);
    });
  });

  describe('when the step is not marked as complete', () => {
    it('fetches the data and returns the correct step progress', async () => {
      const { result, waitForNextUpdate } = setup();

      await waitForNextUpdate();

      expect(result.current?.stepIsComplete(uncompletedStepId)).toBe(false);
    });
  });

  describe('when the step has not been visited yet', () => {
    it('return false', async () => {
      const { result, waitForNextUpdate } = setup();

      await waitForNextUpdate();

      expect(result.current?.stepIsComplete(unvisitedStepId)).toBe(false);
    });
  });
});
