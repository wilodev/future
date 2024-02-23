import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react-hooks';

import { createInMemoryCache } from '~/utils/apollo';

import { StepProgressDocument, StepProgressQuery } from './StepProgressQuery.generated';
// import {
//   StepProgressCompleteDocument,
//   StepProgressCompleteMutation,
// } from './StepProgressCompleteMutation.generated';
import {
  StepProgressUndoDocument,
  StepProgressUndoMutation,
} from './StepProgressUndoMutation.generated';

import useMarkAsComplete from './useMarkAsComplete';

const mockShowToast = jest.fn();
jest.mock('~/utils/useToast', () => () => ({ showToast: mockShowToast }));

describe('useMarkAsComplete', () => {
  beforeAll(() => jest.useFakeTimers());

  const enrolmentId = 'enrolment-1';
  const stepId = 'step-1';
  const stepNumber = '1.0';

  const stepProgressData = (isComplete: boolean) => ({
    __typename: 'StepProgress' as const,
    lastCompletedAt: isComplete ? '2022-03-22T14:05:10Z' : null,
    step: {
      id: 'step-id',
    },
  });

  const setup = (isComplete = true, ...mutationResponses: ReadonlyArray<MockedResponse>) => {
    const queryResponse: MockedResponse<StepProgressQuery> = {
      request: {
        query: StepProgressDocument,
        variables: { enrolmentId, stepId },
      },
      delay: 1000,
      result: {
        data: {
          courseEnrolment: {
            id: enrolmentId,
            stepProgress: stepProgressData(isComplete),
          },
        },
      },
    };

    const step = {
      id: stepId,
      number: stepNumber,
    };

    const cache = createInMemoryCache();

    return renderHook(() => useMarkAsComplete(enrolmentId, step), {
      wrapper: ({ children }: { children: any }) => (
        <MockedProvider cache={cache} mocks={[queryResponse, ...mutationResponses]}>
          {children}
        </MockedProvider>
      ),
    });
  };

  const runAllTimers = () =>
    act(() => {
      jest.runAllTimers();
    });

  describe('while waiting for data', () => {
    it('sets `isComplete` to false', () => {
      const { result } = setup();

      expect(result.current.isComplete).toBe(false);
    });
  });

  describe('when the step is not already marked as complete', () => {
    it('sets `isComplete` to false', () => {
      const { result } = setup(false);

      runAllTimers(); // flush initial query

      expect(result.current.isComplete).toBe(false);
    });
  });

  // describe('when the step is already marked as complete', () => {
  //   it('sets `isComplete` to true', () => {
  //     const { result } = setup(true);

  //     runAllTimers(); // flush initial query

  //     expect(result.current.isComplete).toBe(true);
  //   });
  // });

  describe('when complete() is called', () => {
    // const completeResponse: MockedResponse<StepProgressCompleteMutation> = {
    //   request: {
    //     query: StepProgressCompleteDocument,
    //     variables: { stepId },
    //   },
    //   delay: 1000,
    //   result: {
    //     data: {
    //       stepProgressComplete: {
    //         stepProgress: stepProgressData(true),
    //       },
    //     },
    //   },
    // };

    // it('updates the cached record with the data returned by the mutation', () => {
    //   const { result } = setup(false, completeResponse);

    //   act(() => {
    //     result.current.complete();
    //   });

    //   expect(result.current.isComplete).toBe(false);

    //   runAllTimers(); // flush initial query and mutation

    //   expect(result.current.isComplete).toBe(true);
    // });

    // describe('when the step progress has already been retrieved', () => {
    //   it('optimistically updates the cached record', () => {
    //     const { result } = setup(false, completeResponse);

    //     runAllTimers(); // flush initial query

    //     act(() => {
    //       result.current.complete();
    //     });

    //     expect(result.current.isComplete).toBe(true);
    //   });
    // });

    describe('when there is an error', () => {
      // const completeWithError = () => {
      //   const rendered = setup(false, {
      //     ...completeResponse,
      //     result: undefined,
      //     error: new Error(),
      //   });
      //   runAllTimers(); // flush initial query
      //   act(() => {
      //     rendered.result.current.complete();
      //   });
      //   return rendered;
      // };
      // it('shows the toast message', () => {
      //   completeWithError();
      //   runAllTimers(); // flush mutation
      //   expect(mockShowToast).toHaveBeenCalledWith(
      //     `Could not mark step ${stepNumber} as complete. Your device may be offline.`,
      //     { duration: 4500 },
      //   );
      // });
      // it('restores the cached record to its original state', () => {
      //   const { result } = completeWithError();
      //   expect(result.current.isComplete).toBe(true);
      //   runAllTimers(); // flush mutation
      //   expect(result.current.isComplete).toBe(false);
      // });
    });
  });

  describe('when undo() is called', () => {
    const undoResponse: MockedResponse<StepProgressUndoMutation> = {
      request: {
        query: StepProgressUndoDocument,
        variables: { stepId },
      },
      delay: 1000,
      result: {
        data: {
          stepProgressUndo: {
            stepProgress: stepProgressData(false),
          },
        },
      },
    };

    it('optimistically updates the cached record', () => {
      const { result } = setup(true, undoResponse);

      runAllTimers(); // flush initial query

      act(() => {
        result.current.undo();
      });

      expect(result.current.isComplete).toBe(false);
    });

    describe('when the mutation returns an error', () => {
      // const undoWithError = () => {
      //   const rendered = setup(true, { ...undoResponse, result: undefined, error: new Error() });
      //   runAllTimers(); // flush initial query
      //   act(() => {
      //     rendered.result.current.undo();
      //   });
      //   return rendered;
      // };
      // it('shows the toast message', () => {
      //   undoWithError();
      //   runAllTimers(); // flush mutation
      //   expect(mockShowToast).toHaveBeenCalledWith(
      //     `Could not unmark step ${stepNumber} as complete. Your device may be offline.`,
      //     { duration: 4500 },
      //   );
      // });
      // it('restores the cached record to its original state', () => {
      //   const { result } = undoWithError();
      //   expect(result.current.isComplete).toBe(false);
      //   runAllTimers(); // flush mutation
      //   expect(result.current.isComplete).toBeTruthy();
      // });
    });
  });
});
