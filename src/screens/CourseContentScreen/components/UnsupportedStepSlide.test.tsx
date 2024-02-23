import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import UnsupportedStepSlide from './UnsupportedStepSlide';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';

const mockTrackEvent = jest.fn();

jest.mock('~/utils/useLargeDevice');

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useIsFocused: () => false,
  };
});

(useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });

describe('UnsupportedStepSlide', () => {
  const navigateMock = jest.fn();

  const setup = () => {
    const routeProps = { stepId: '567', stepTitle: 'title', runId: '333' };

    const renderScreen = () =>
      render(
        <UnsupportedStepSlide
          {...routeProps}
          animationValues={{ footerHeight: 60 } as any}
          navigateToWebView={navigateMock}
        />,
      );

    return { renderScreen };
  };

  it('renders the unsupported content notice with correct WebView link', async () => {
    const { findByText, getByText } = setup().renderScreen();

    expect(
      await findByText(`This step isn't yet available in the app, but we're working on it!`),
    ).toBeTruthy();

    fireEvent.press(getByText('Open in web browser'));

    expect(navigateMock).toHaveBeenCalledWith('unsupportedStepLink');
  });

  describe('when it is not a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });
    });

    it('renders the UnsupportedStepSlide with full width', async () => {
      const { findByTestId } = setup().renderScreen();

      expect(await findByTestId('container')).not.toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });

  describe('when it is a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: true });
    });

    it('renders the UnsupportedStepSlide with constrained width', async () => {
      const { findByTestId } = setup().renderScreen();

      expect(await findByTestId('container')).toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });
});
