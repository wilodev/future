import { renderHook } from '@testing-library/react-hooks';
import Toast from 'react-native-root-toast';
import useToast from './useToast';

const MOCK_BOTTOM_INSET = 50;

jest.mock('~/designSystem/themes', () => ({
  useTheme: () => ({
    colors: {
      toast: 'toast-color',
      text: 'text-color',
    },
  }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: MOCK_BOTTOM_INSET }),
}));

describe('useToast', () => {
  const setup = () => {
    jest.spyOn(Toast, 'show');

    return renderHook(useToast).result.current;
  };

  describe('showToast', () => {
    it('displays the toast with the correct message, colors and position', () => {
      setup().showToast('Hello');

      expect(Toast.show).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({
          backgroundColor: 'toast-color',
          position: -(MOCK_BOTTOM_INSET + 20),
          textColor: 'text-color',
        }),
      );
    });

    it('merges any custom options with our defaults', () => {
      setup().showToast('Hello', { opacity: 0.5 });

      expect(Toast.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          opacity: 0.5,
          shadow: false,
        }),
      );
    });
  });
});
