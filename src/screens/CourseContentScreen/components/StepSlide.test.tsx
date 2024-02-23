import React from 'react';
import { fireEvent, render, waitForElementToBeRemoved } from '@testing-library/react-native';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

import StepSlide from './StepSlide';
import { StepContentDocument, StepContentQuery } from '../StepContentQuery.generated';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import { createInMemoryCache } from '~/utils/apollo';

jest.mock('~/utils/useLargeDevice');

jest.mock('react-native-video', () => 'Video');
(useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useIsFocused: () => false,
  };
});

const mockTrackEvent = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));

describe('StepSlide', () => {
  const request = {
    query: StepContentDocument,
    variables: {
      stepId: '567',
    },
  };

  const defaultResponse: MockedResponse<StepContentQuery> = {
    request,
    result: {
      data: {
        contentByStepId: {
          __typename: 'Article',
          id: '1234',
          bodyForMobileApp: '<p>A sample step with article content</p>',
          copyrightForMobileApp: '',
        },
      },
    },
  };

  const navigateMock = jest.fn();

  const setup = (apolloResponse = defaultResponse) => {
    const routeProps = { stepId: '567', stepTitle: 'title', runId: '333' };

    const renderScreen = () =>
      render(
        <MockedProvider mocks={[apolloResponse]} cache={createInMemoryCache()}>
          <StepSlide
            {...routeProps}
            animationValues={{} as any}
            navigateToWebView={navigateMock}
            currentIndex={1}
            videoAnimatedStyle={{} as any}
          />
        </MockedProvider>,
      );

    return { renderScreen };
  };

  describe('When the step is supported', () => {
    it('render the `SupportedStepSlide` component', async () => {
      const { findByText } = setup().renderScreen();

      expect(await findByText('A sample step with article content')).toBeTruthy();
    });
  });

  describe('When the step is unsupported', () => {
    it('renders the `UnsupportedStepSlide` component', async () => {
      const unsupportedContentResponse: MockedResponse<StepContentQuery> = {
        request,
        result: {
          data: { contentByStepId: { id: '123' } },
        },
      };

      const { findByText, getByText } = setup(unsupportedContentResponse).renderScreen();

      expect(
        await findByText(`This step isn't yet available in the app, but we're working on it!`),
      ).toBeTruthy();

      fireEvent.press(getByText('Open in web browser'));

      expect(navigateMock).toHaveBeenCalledWith('unsupportedStepLink');
    });
  });

  describe('when data is loading', () => {
    it('renders a loading message', async () => {
      const { queryByTestId } = setup().renderScreen();

      expect(queryByTestId('loading-indicator')).toBeTruthy();

      await waitForElementToBeRemoved(() => queryByTestId('loading-indicator'));
    });

    it('does not renders the supported nor unsupported step components while the loading indicator is being rendered', async () => {
      const { queryByTestId, queryAllByText } = setup().renderScreen();

      expect(queryAllByText('A sample step with article content').length).toBe(0);

      expect(
        queryAllByText(`This step isn't yet available in the app, but we're working on it!`).length,
      ).toBe(0);

      await waitForElementToBeRemoved(() => queryByTestId('loading-indicator'));
    });
  });

  describe('when there is an error', () => {
    it('renders an error message', async () => {
      const { findByText } = setup({
        request,
        error: new Error('Sample error'),
      }).renderScreen();

      expect(await findByText('Something went wrong')).toBeTruthy();
    });
  });

  describe('when it is not a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });
    });

    it('renders the ErrorBanner with full width', async () => {
      const { findByTestId } = setup({
        request,
        error: new Error('Sample error'),
      }).renderScreen();

      expect(await findByTestId('error-banner-container')).not.toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });

  describe('when it is a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: true });
    });

    it('renders the ErrorBanner with constrained width', async () => {
      const { findByTestId } = setup({
        request,
        error: new Error('Sample error'),
      }).renderScreen();

      expect(await findByTestId('error-banner-container')).toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });
});
