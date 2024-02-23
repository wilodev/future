import { renderHook } from '@testing-library/react-hooks';
import { Dimensions } from 'react-native';
import useLargeDevice from '~/utils/useLargeDevice';

import { bottomSheetOptions, DIALOG_OPTIONS, useModalOptions } from './utils';

jest.mock('~/utils/useLargeDevice');

describe('utils', () => {
  describe('useModalOptions', () => {
    const mockIsLargeDevice = (isLargeDevice: boolean) =>
      (useLargeDevice as jest.MockedFunction<typeof useLargeDevice>).mockReturnValue({
        isLargeDevice,
        height: 0,
      });

    describe('on small devices', () => {
      beforeEach(() => mockIsLargeDevice(false));

      it('returns the bottom sheet options for `bottomSheetOrDialogOptions`', () => {
        const { bottomSheetOrDialogOptions } = renderHook(useModalOptions).result.current;

        expect(bottomSheetOrDialogOptions).toEqual(
          bottomSheetOptions(Dimensions.get('window').height),
        );
      });

      it('returns an empty object for `fullScreenOrDialogOptions`', () => {
        const { fullScreenOrDialogOptions } = renderHook(useModalOptions).result.current;

        expect(fullScreenOrDialogOptions).toEqual({});
      });
    });

    describe('on large devices', () => {
      beforeEach(() => mockIsLargeDevice(true));

      it('returns the dialog options for both screen types', () => {
        const { bottomSheetOrDialogOptions, fullScreenOrDialogOptions } =
          renderHook(useModalOptions).result.current;

        expect(fullScreenOrDialogOptions).toEqual(DIALOG_OPTIONS);
        expect(bottomSheetOrDialogOptions).toEqual(DIALOG_OPTIONS);
      });
    });
  });
});
