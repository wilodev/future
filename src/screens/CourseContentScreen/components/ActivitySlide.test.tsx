import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import ActivitySlide from './ActivitySlide';
import useLargeDevice, { LARGE_DEVICE_CONTAINER_WIDTH } from '~/utils/useLargeDevice';

jest.mock('~/utils/useLargeDevice');

(useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });

describe('ActivitySlide', () => {
  const setup = (imageUrl?: string) => {
    const routeProps = {
      id: '567',
      title: 'A sample activity title',
      description: 'A sample activity description',
      placeholder: 'Sample activity placeholder',
      activityLength: 1,
      imageUrl,
    };

    const renderScreen = () =>
      render(<ActivitySlide {...routeProps} animationValues={{} as any} />);

    return { renderScreen };
  };

  describe('when the Activity slide image is not provided', () => {
    it('does not render the Image or placeholder', async () => {
      const { queryByTestId } = setup().renderScreen();

      expect(queryByTestId('activity-image')).toBeFalsy();
      expect(queryByTestId('loading-indicator')).toBeFalsy();
    });
  });

  describe('when the Activity slide image is provided', () => {
    describe('when the image is loading', () => {
      it('renders the image placeholder with an ActivityIndicator', async () => {
        const { queryByTestId } = setup('/image-url').renderScreen();

        expect(queryByTestId('loading-indicator')).toBeTruthy();
      });
    });

    describe('when the image has finished loading', () => {
      it('does not render the image placeholder with ActivityIndicator', async () => {
        const { queryByTestId, findByTestId } = setup('/image-url').renderScreen();
        await act(async () => fireEvent(await findByTestId('activity-image'), 'onLoadEnd'));

        expect(queryByTestId('loading-indicator')).toBeFalsy();
      });
    });
  });

  describe('when Activity slide has loaded', () => {
    it('renders the activity content', async () => {
      const { getByText } = setup('/url').renderScreen();

      expect(getByText('A sample activity title')).toBeTruthy();
    });
  });

  describe('when it is not a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: false });
    });

    it('renders the ActivitySlide with full width', async () => {
      const { getByTestId } = setup().renderScreen();

      expect(getByTestId('activity-slide-container')).not.toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });

  describe('when it is a large device', () => {
    beforeEach(() => {
      (useLargeDevice as jest.Mock).mockReturnValue({ isLargeDevice: true });
    });

    it('renders the ActivitySlide with constrained width', async () => {
      const { getByTestId } = setup().renderScreen();

      expect(getByTestId('activity-slide-container')).toHaveStyle({
        width: LARGE_DEVICE_CONTAINER_WIDTH,
      });
    });
  });
});
