import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { CourseContentItem, CourseContentStep, CourseContentActivity } from '.';
import useStepVisitTracking from './useStepVisitTracking';
import { MockedProvider, MockedResponse, MockLink } from '@apollo/client/testing';
import { StepVisitTrackDocument, StepVisitTrackMutation } from './StepVisitTrackMutation.generated';
import { ApolloLink, from, Operation } from '@apollo/client';

describe('useStepVisitTracking', () => {
  const fakeDateNow = new Date(2022, 1, 18, 9, 0, 0);
  const fakeDateISOString = new Date(fakeDateNow).toISOString();

  const stepBase: Omit<CourseContentStep, 'contentType'> = {
    id: 'step-id',
    title: 'Article title',
    itemType: 'Step',
    number: '12.5',
    mobileSsoUrl: 'https://example.com/step',
  };

  const articleStep: CourseContentStep = {
    ...stepBase,
    contentType: 'Article',
  };

  const activity: CourseContentActivity = {
    id: 'activity-id',
    title: 'Activity title',
    itemType: 'Activity',
    shortDescription: 'Desc',
    stepCount: 2,
    imageUrl: '/url',
  };

  const mockResponseForStep = (stepId: string): MockedResponse<StepVisitTrackMutation> => ({
    request: {
      query: StepVisitTrackDocument,
      variables: { stepId, visitedAt: fakeDateISOString },
    },
    result: {
      data: {
        stepVisitTrack: {
          visitedAt: fakeDateISOString,
          errors: [],
        },
      },
    },
  });

  const runAllTimers = () =>
    act(() => {
      jest.runAllTimers();
    });

  const trackOperationForStep = (stepId: string) =>
    expect.objectContaining({
      operationName: 'StepVisitTrack',
      variables: { stepId, visitedAt: fakeDateISOString },
      context: expect.objectContaining({ retry: true }),
    });

  const setup = (
    initialItem?: CourseContentItem,
    ...mockResponses: MockedResponse<StepVisitTrackMutation>[]
  ) => {
    jest.useFakeTimers();
    jest.spyOn(Date, 'now').mockReturnValue(fakeDateNow.valueOf());

    const graphqlOperations: (Operation & { context: ReturnType<Operation['getContext']> })[] = [];

    const mockLink = new MockLink(mockResponses);

    const spyLink = new ApolloLink((operation, forward) => {
      graphqlOperations.push({ ...operation, context: operation.getContext() });
      return forward(operation);
    });

    const Wrapper: React.FC<{ currentItem: CourseContentItem; children?: ReactNode }> = ({
      children,
    }) => <MockedProvider link={from([spyLink, mockLink])}>{children}</MockedProvider>;

    const rendered = renderHook(
      ({ currentItem }: { currentItem: CourseContentItem; children?: ReactNode }) =>
        useStepVisitTracking(currentItem),
      {
        initialProps: { currentItem: initialItem || articleStep },
        wrapper: Wrapper,
      },
    );

    return { ...rendered, graphqlOperations };
  };

  describe('when the user moves to another step within 5 seconds', () => {
    it('only tracks the second step visit', () => {
      const { rerender, graphqlOperations } = setup(
        { ...articleStep, id: 'step-id-1' },
        mockResponseForStep('step-id-2'),
      );

      jest.advanceTimersByTime(4000);

      rerender({ currentItem: { ...articleStep, id: 'step-id-2' } });

      runAllTimers();

      expect(graphqlOperations).not.toContainEqual(trackOperationForStep('step-id-1'));
      expect(graphqlOperations).toContainEqual(trackOperationForStep('step-id-2'));
    });
  });

  describe('when the user moves to another step after 5 seconds', () => {
    it('tracks both step visits', () => {
      const { rerender, graphqlOperations } = setup(
        { ...articleStep, id: 'step-id-1' },
        mockResponseForStep('step-id-1'),
        mockResponseForStep('step-id-2'),
      );

      act(() => {
        jest.advanceTimersByTime(6000);
      });

      rerender({ currentItem: { ...articleStep, id: 'step-id-2' } });

      runAllTimers();

      expect(graphqlOperations).toContainEqual(trackOperationForStep('step-id-1'));
      expect(graphqlOperations).toContainEqual(trackOperationForStep('step-id-2'));
    });
  });

  describe('when the step has an Article contentType', () => {
    it('tracks a step visit', () => {
      const { graphqlOperations } = setup(
        { ...articleStep, id: 'step-id' },
        mockResponseForStep('step-id'),
      );

      runAllTimers();

      expect(graphqlOperations).toContainEqual(trackOperationForStep('step-id'));
    });
  });

  describe('when the step has an VideoArticle contentType', () => {
    it('tracks a step visit', () => {
      const { graphqlOperations } = setup(
        {
          ...stepBase,
          id: 'step-id',
          contentType: 'VideoArticle',
        },
        mockResponseForStep('step-id'),
      );

      runAllTimers();

      expect(graphqlOperations).toContainEqual(trackOperationForStep('step-id'));
    });
  });

  describe('when the currentItem is not yet available', () => {
    it('does not track a step visit', () => {
      const { graphqlOperations } = setup();
      runAllTimers();

      expect(graphqlOperations.length).toBe(1);
    });
  });

  describe('when the currentItem is not an Article contentType', () => {
    it('does not track a step visit', () => {
      const { graphqlOperations } = setup({ ...stepBase, contentType: 'Discussion' });
      runAllTimers();

      expect(graphqlOperations.length).toBe(0);
    });
  });

  describe('when the currentItem is an activity', () => {
    it('does not track a step visit', () => {
      const { graphqlOperations } = setup(activity);
      runAllTimers();

      expect(graphqlOperations.length).toBe(0);
    });
  });

  describe('when component unmounts within 5 seconds', () => {
    it('does not track a step visit', () => {
      const { unmount, graphqlOperations } = setup(articleStep);

      jest.advanceTimersByTime(4000);
      unmount();
      runAllTimers();

      expect(graphqlOperations.length).toBe(0);
    });
  });

  // describe('when there is a network error', () => {
  //   it('outputs the error to console.warn', () => {
  //     jest.spyOn(console, 'warn').mockImplementation();

  //     const error = new Error();

  //     const errorResponse = {
  //       ...mockResponseForStep('step-id'),
  //       error: error,
  //       result: undefined,
  //     };
  //     setup({ ...articleStep, id: 'step-id' }, errorResponse);

  //     runAllTimers();

  //     expect(console.warn).toHaveBeenCalledWith();
  //   });
  // });
});
