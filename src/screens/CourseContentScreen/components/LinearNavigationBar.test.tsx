import React from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import LinearNavigationBar, { LinearNavigationBarProps } from './LinearNavigationBar';
import { showMarkAsComplete } from '~/utils/stepCompletion';

import { CourseContentItem } from '..';

jest.mock('~/utils/stepCompletion');
jest.mock('~/utils/useLargeDevice');

const MockMarkAsCompleteButton = () => <View testID="mock-mark-as-complete-button" />;
jest.mock('./MarkAsCompleteButton', () => () => <MockMarkAsCompleteButton />);

describe('LinearNavigationBar', () => {
  const stepItem: CourseContentItem = {
    id: 'step-id',
    itemType: 'Step',
    contentType: 'Article',
    number: '1.1',
    title: 'Title',
    mobileSsoUrl: 'sso',
  };

  const activityItem: CourseContentItem = {
    id: 'activity-id',
    itemType: 'Activity',
    shortDescription: 'desc',
    title: 'Title',
    stepCount: 2,
  };

  const renderComponent = ({
    onPrevious,
    onNext,
    currentItem = stepItem,
  }: Partial<LinearNavigationBarProps> = {}) =>
    render(
      <LinearNavigationBar
        currentItem={currentItem}
        onPrevious={onPrevious}
        onNext={onNext}
        enrolmentId="enrolment-id"
      />,
    );

  describe('when an `onPrevious` callback is provided', () => {
    it('enables the previous button', () => {
      const previousButton = renderComponent({ onPrevious: () => {} }).getByTestId(
        'previous-button',
      );

      expect(previousButton).not.toBeDisabled();
    });

    it('is invoked when the previous button is pressed', () => {
      const onPrevious = jest.fn();

      fireEvent.press(renderComponent({ onPrevious }).getByTestId('previous-button'));

      expect(onPrevious).toHaveBeenCalled();
    });
  });

  describe('when no `onPrevious` callback is provided', () => {
    it('disables the previous button', () => {
      const previousButton = renderComponent({ onPrevious: undefined }).getByTestId(
        'previous-button',
      );

      expect(previousButton).toBeDisabled();
    });
  });

  describe('when an `onNext` callback is provided', () => {
    it('enables the next button', () => {
      const nextButton = renderComponent({ onNext: () => {} }).getByTestId('next-button');

      expect(nextButton).not.toBeDisabled();
    });

    it('is invoked when the next button is pressed', () => {
      const onNext = jest.fn();

      fireEvent.press(renderComponent({ onNext }).getByTestId('next-button'));

      expect(onNext).toHaveBeenCalled();
    });
  });

  describe('when no `onNext` callback is provided', () => {
    it('disables the next button', () => {
      const nextButton = renderComponent({ onNext: undefined }).getByTestId('next-button');

      expect(nextButton).toBeDisabled();
    });
  });

  describe('when the current item is an activity', () => {
    it('does not render the mark as complete button', () => {
      const { queryByTestId } = renderComponent({ currentItem: activityItem });

      expect(queryByTestId('mock-mark-as-complete-button')).toBeFalsy();
    });
  });

  describe('when the current item is a step', () => {
    describe('when the mark as complete button should be shown', () => {
      beforeEach(() => {
        (showMarkAsComplete as jest.Mock).mockReturnValue(true);
      });

      it('renders the mark as complete button', () => {
        const { queryByTestId } = renderComponent({ currentItem: stepItem });

        expect(queryByTestId('mock-mark-as-complete-button')).toBeTruthy();
      });
    });

    describe("when the mark as complete button shouldn't be shown", () => {
      beforeEach(() => {
        (showMarkAsComplete as jest.Mock).mockReturnValue(false);
      });

      it('does not render the mark as complete button', () => {
        const { queryByTestId } = renderComponent({ currentItem: stepItem });

        expect(queryByTestId('mock-mark-as-complete-button')).toBeFalsy();
      });
    });
  });
});
