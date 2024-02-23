import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import {
  RootNavigationParamList,
  RootNavigationProp,
  RootRouteProp,
} from '~/navigators/RootNavigationStack';
import { RemindersData } from '~/utils/notifications';

import LearningRemindersSuccessScreen from '.';

describe('LearningRemindersSuccessScreen', () => {
  const DEPTH = 5;
  const popFn = jest.fn();

  const renderScreen = (remindersData?: RemindersData) => {
    const navigation = {
      pop: popFn,
    } as Partial<
      RootNavigationProp<'LearningRemindersSuccess'>
    > as RootNavigationProp<'LearningRemindersSuccess'>;

    const params: RootNavigationParamList['LearningRemindersSuccess'] = {
      remindersData: {
        useReminders: true,
        monday: true,
        time: new Date(2022, 3, 4, 5, 30).valueOf(),
        ...remindersData,
      },
      depth: DEPTH,
    };

    const route = { params } as RootRouteProp<'LearningRemindersSuccess'>;

    return render(<LearningRemindersSuccessScreen navigation={navigation} route={route} />);
  };

  it('includes a list of days that the reminder is enabled for', () => {
    const { getByText } = renderScreen({
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: true,
      sunday: false,
    });

    expect(getByText('Monday, Tuesday and Saturday')).toBeTruthy();
  });

  describe('when the finish button is tapped', () => {
    it('pops the correct number of screens from the stack', () => {
      const { getByText } = renderScreen();

      fireEvent.press(getByText('Finish'));

      expect(popFn).toHaveBeenCalledWith(DEPTH);
    });
  });
});
