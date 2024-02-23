import { isIOS } from './platform';

export const formatLongDate = (date: Date) =>
  date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatShortTime = (date: Date) =>
  date.toLocaleTimeString(
    undefined,
    isIOS()
      ? {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }
      : {
          hour: 'numeric',
          minute: 'numeric',
        },
  );

export const format24HourTime = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
