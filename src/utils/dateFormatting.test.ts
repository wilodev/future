import { formatShortTime } from './dateFormatting';
import { withOS } from './TestUtils';

describe('formatShortTime', () => {
  const mockToLocaleTimeString = jest.fn();
  const mockDate: Date = {
    toLocaleTimeString: mockToLocaleTimeString,
  } as any;

  describe('on Android', () => {
    withOS('android');

    it('formats the hours and minutes using the time formatting conventions for the device locale', () => {
      formatShortTime(mockDate);

      expect(mockToLocaleTimeString).toHaveBeenCalledWith(undefined, {
        hour: 'numeric',
        minute: 'numeric',
      });
    });
  });

  describe('on iOS', () => {
    withOS('ios');

    it('always uses a 12-hour format', () => {
      formatShortTime(mockDate);

      expect(mockToLocaleTimeString).toHaveBeenCalledWith(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    });
  });
});
