import React from 'react';
import { fireEvent, render, within } from '@testing-library/react-native';
import { NetworkStatus } from '@apollo/client';

import SupportedStepSlide, { contentType } from './SupportedStepSlide';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';
import { VideoStatus } from '~/components/Video';

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

describe('SupportedStepSlide', () => {
  const articleContent: contentType = {
    __typename: 'Article',
    id: '1234',
    bodyForMobileApp: '<p>A sample step with article content</p>',
  };

  const navigateMock = jest.fn();

  const setup = (content: contentType = articleContent) => {
    const routeProps = { stepId: '567', stepTitle: 'title', runId: '333' };

    const renderScreen = () =>
      render(
        <SupportedStepSlide
          {...routeProps}
          animationValues={{} as any}
          navigateToWebView={navigateMock}
          currentIndex={1}
          videoAnimatedStyle={{} as any}
          content={content}
          networkStatus={NetworkStatus.ready}
          refresh={() => null}
          refreshing={false}
        />,
      );

    return { renderScreen };
  };

  describe('When the content is an Article Step', () => {
    it('displays content', async () => {
      const { findByText } = setup().renderScreen();

      expect(await findByText('A sample step with article content')).toBeTruthy();
    });

    it('displays unsupported comments notice with correct WebView link', async () => {
      const { findByText, getByText } = setup().renderScreen();

      expect(
        within(await findByText('For commenting on this step', { exact: false })).getByText(
          'open in a web browser',
        ),
      ).toBeTruthy();

      fireEvent.press(getByText('open in a web browser'));

      expect(navigateMock).toHaveBeenCalledWith('supportedStepLink');
    });
  });

  describe('When the content is a Video Step', () => {
    const videoArticleContent: contentType = {
      __typename: 'VideoArticle',
      id: '352406',
      bodyForMobileApp:
        '<p>Welcome to our course, Providing High-Quality Paediatric Dentistry.</p>',
      video: {
        __typename: 'Video',
        hlsUrl: 'https://www.someurl.com',
        posterImageUrl: 'https://www.someurl.com',
        status: VideoStatus.Available,
        englishTranscript: null,
      },
    };

    it('displays video content', async () => {
      const { findByText, queryByTestId } = setup(videoArticleContent).renderScreen();

      expect(
        await findByText('Welcome to our course, Providing High-Quality Paediatric Dentistry.'),
      ).toBeTruthy();

      expect(queryByTestId('video')).toBeTruthy();
    });

    it('displays unsupported subtitles and comments notice with the correct WebView link', async () => {
      const { findByText, getByText } = setup(videoArticleContent).renderScreen();

      expect(
        within(
          await findByText('For video subtitles and commenting on this step', { exact: false }),
        ).getByText('open in a web browser'),
      ).toBeTruthy();

      fireEvent.press(getByText('open in a web browser'));

      expect(navigateMock).toHaveBeenCalledWith('supportedStepLink');
    });

    it('displays video poster', async () => {
      const { findByTestId } = setup(videoArticleContent).renderScreen();
      expect(await findByTestId('video-poster')).toBeTruthy();
    });

    it('hides video poster when tapped upon', async () => {
      const { queryByTestId, findByTestId } = setup(videoArticleContent).renderScreen();

      expect(await findByTestId('video-poster')).toBeTruthy();

      const posterElement = queryByTestId('video-poster');
      posterElement && fireEvent.press(posterElement);
      expect(queryByTestId('video-poster')).toBeNull();
    });

    it('displays no transcript available', async () => {
      const { findByText } = setup(videoArticleContent).renderScreen();
      expect(await findByText('No transcript available')).toBeTruthy();
    });
  });

  describe('When the content has a copyright notice', () => {
    const articleWithCopyrightContent: contentType = {
      __typename: 'Article',
      id: '1234',
      bodyForMobileApp: '<p>A sample step with article content</p>',
      copyrightForMobileApp: '<p>A copyright notice</p>',
    };

    it('displays the copyright notice', async () => {
      const { findByText } = setup(articleWithCopyrightContent).renderScreen();

      expect(await findByText('A copyright notice')).toBeTruthy();
    });
  });

  describe('when it is not a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });
    });

    it('renders the SupportedStepSlide with full width', async () => {
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

    it('renders the SupportedStepSlide with constrained width', async () => {
      const { findByTestId } = setup().renderScreen();

      expect(await findByTestId('container')).toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });
});
