import Toast, { ToastOptions } from 'react-native-root-toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '~/designSystem/themes';

export default () => {
  const { bottom } = useSafeAreaInsets();
  const { colors } = useTheme();

  const defaultOptions: ToastOptions = {
    backgroundColor: colors.toast,
    opacity: 1,
    position: -(bottom + 20),
    shadow: false,
    textColor: colors.text,
  };

  const showToast = (message: string, options?: ToastOptions) =>
    Toast.show(message, { ...defaultOptions, ...options });

  return { showToast };
};
