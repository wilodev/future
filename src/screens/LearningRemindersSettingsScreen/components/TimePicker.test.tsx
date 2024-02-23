import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import TimePicker, { EventType } from './TimePicker';
import { withOS } from '~/utils/TestUtils';

jest.mock('@react-native-community/datetimepicker', () => 'mock-date-time');

describe('TimePicker', () => {
  const defaultTime = new Date(2022, 2, 2, 12, 0).valueOf();
  const newSelectedTime = new Date(2022, 2, 2, 2, 30);

  const setup = () => {
    const mockOnFormUpdate = jest.fn();
    const mockScrollToTimePicker = jest.fn();
    const rendered = render(
      <TimePicker
        value={defaultTime}
        onFormUpdate={mockOnFormUpdate}
        scrollToTimePicker={mockScrollToTimePicker}
      />,
    );

    return { ...rendered, mockOnFormUpdate, mockScrollToTimePicker };
  };

  describe('when the device is Android', () => {
    withOS('android');

    it('the DateTimePicker is hidden on first render', () => {
      expect(setup().queryByTestId('time')).toBe(null);
    });

    it('does not try to scroll the DateTimePicker into view when the time row is tapped', async () => {
      const { getByText, mockScrollToTimePicker } = setup();

      await fireEvent.press(getByText('Time'));

      expect(mockScrollToTimePicker).not.toHaveBeenCalled();
    });

    describe('when the time row is tapped', () => {
      it('the DateTimePicker is shown', async () => {
        const { getByText, queryByTestId } = setup();

        await fireEvent.press(getByText('Time'));

        expect(queryByTestId('time')).toBeTruthy();
      });
    });

    describe('when a time is selected and set button is tapped', () => {
      it('onFormUpdate is called and DateTimePicker closes', async () => {
        const { getByText, getByTestId, mockOnFormUpdate } = setup();

        await fireEvent.press(getByText('Time'));
        await fireEvent(
          getByTestId('time'),
          'change',
          {
            type: EventType.set,
          },
          newSelectedTime,
        );

        expect(mockOnFormUpdate).toHaveBeenCalledWith(newSelectedTime.valueOf());
      });
    });

    describe('when the dismissed button is tapped', () => {
      it('DateTimePicker modal should close', async () => {
        const { getByText, getByTestId, queryByTestId, mockOnFormUpdate } = setup();

        await fireEvent.press(getByText('Time'));
        await fireEvent(getByTestId('time'), 'change', {
          type: EventType.dismissed,
        });

        expect(queryByTestId('time')).toBe(null);
        expect(mockOnFormUpdate).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the device is iOS', () => {
    withOS('ios');

    it('the DateTimePicker is shown on first render', () => {
      expect(setup().queryByTestId('time')).toBeTruthy();
    });

    it('scrolls the DateTimePicker into view when the time row is tapped', async () => {
      const { getByText, mockScrollToTimePicker } = setup();

      await fireEvent.press(getByText('Time'));

      expect(mockScrollToTimePicker).toHaveBeenCalled();
    });

    describe('when a time is selected', () => {
      it('onFormUpdate is called and the DateTimePicker continues to be visible', async () => {
        const { queryByTestId, getByTestId, mockOnFormUpdate } = setup();

        await fireEvent(
          getByTestId('time'),
          'change',
          {
            type: EventType.set,
          },
          newSelectedTime,
        );

        expect(mockOnFormUpdate).toHaveBeenCalledWith(newSelectedTime.valueOf());
        expect(queryByTestId('time')).toBeTruthy();
      });
    });
  });
});
