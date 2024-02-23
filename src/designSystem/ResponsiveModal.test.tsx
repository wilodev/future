import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import useLargeDevice from '~/utils/useLargeDevice';

import ResponsiveModal from './ResponsiveModal';

jest.mock('~/utils/useLargeDevice');

describe('ResponsiveModal', () => {
  const setup = (isLargeDevice: boolean) => {
    (useLargeDevice as jest.MockedFunction<typeof useLargeDevice>).mockReturnValue({
      isLargeDevice,
      height: 0,
    });

    const onClose = jest.fn();
    const renderComponent = () =>
      render(
        <ResponsiveModal onClose={onClose} nameForAccessibility="Modal">
          content
        </ResponsiveModal>,
      );

    return { onClose, renderComponent };
  };

  describe('on large devices', () => {
    it('calls onClose when the scrim is pressed', () => {
      const { onClose, renderComponent } = setup(true);
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('scrim'));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when the close button is pressed', () => {
      const { onClose, renderComponent } = setup(true);
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('close-button'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('on small devices', () => {
    it('calls onClose when the scrim is pressed', () => {
      const { onClose, renderComponent } = setup(false);
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId('scrim'));

      expect(onClose).toHaveBeenCalled();
    });

    it('does not render the close button', () => {
      const { queryByTestId } = setup(false).renderComponent();

      expect(queryByTestId('close-button')).toBeNull();
    });
  });
});
