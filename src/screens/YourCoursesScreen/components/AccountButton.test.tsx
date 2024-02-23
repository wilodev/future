import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AccountButton from './AccountButton';

const mockTrackEvent = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));

describe('AccountButton', () => {
  it('opens the account screen when the button is pressed', async () => {
    const navigateFn = jest.fn();

    const { getByTestId } = render(<AccountButton navigate={navigateFn} />);

    fireEvent.press(getByTestId('account-button'));

    expect(navigateFn).toBeCalledWith('Account');

    expect(mockTrackEvent).toHaveBeenCalledWith('Open account screen', 'Account');
  });
});
