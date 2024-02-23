import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { RootNavigationProp, RootRouteProp } from '~/navigators/RootNavigationStack';
import { withOS } from '~/utils/TestUtils';

import HeaderBackButton from './HeaderBackButton';

describe('HeaderBackButton', () => {
  const DEPTH = 3;
  const popFn = jest.fn();

  const setup = () => {
    const navigation = { pop: popFn } as Partial<
      RootNavigationProp<'LearningRemindersSettings'>
    > as RootNavigationProp<'LearningRemindersSettings'>;

    const route = { params: { depth: DEPTH } } as RootRouteProp<'LearningRemindersSettings'>;

    return render(<HeaderBackButton navigation={navigation} route={route} />);
  };

  describe('when the device is Android', () => {
    withOS('android');

    it('displays an icon link', () => {
      expect(setup().getByTestId('close-icon-button')).toBeTruthy();
    });

    it('closes the screen when the link is tapped', async () => {
      const { getByTestId } = setup();

      await fireEvent.press(getByTestId('close-icon-button'));

      expect(popFn).toHaveBeenCalledWith(DEPTH);
    });
  });

  describe('when the device is iOS', () => {
    withOS('ios');

    it('displays a text link', () => {
      expect(setup().getByText('Cancel')).toBeTruthy();
    });

    it('closes the screen when the link is tapped', async () => {
      const { getByText } = setup();

      await fireEvent.press(getByText('Cancel'));

      expect(popFn).toHaveBeenCalledWith(DEPTH);
    });
  });
});
