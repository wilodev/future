import { asPercentForDisplay, asPercentForStyleProp } from './numberFormatting';

describe('asPercentForDisplay', () => {
  it('formats the number as percentage using the device locale', () => {
    const mockNumber = {
      toLocaleString: jest.fn(() => 'formatted-percentage'),
    } as any;

    expect(asPercentForDisplay(mockNumber, { minimumFractionDigits: 1 })).toEqual(
      'formatted-percentage',
    );

    expect(mockNumber.toLocaleString).toHaveBeenCalledWith(undefined, {
      style: 'percent',
      minimumFractionDigits: 1,
    });
  });
});

describe('asPercentForStyleProp', () => {
  it('formats the number as a rounded percentage', () => {
    expect(asPercentForStyleProp(0.265)).toEqual('27%');
  });
});
