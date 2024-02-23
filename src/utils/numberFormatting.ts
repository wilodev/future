export type PercentageFormatOptions = Pick<
  Intl.NumberFormatOptions,
  'minimumFractionDigits' | 'maximumFractionDigits'
>;

export const asPercentForDisplay = (number: number, options: PercentageFormatOptions = {}) =>
  number.toLocaleString(undefined, { style: 'percent', ...options });

export const asPercentForStyleProp = (number: number) => `${Math.round(number * 100)}%`;
