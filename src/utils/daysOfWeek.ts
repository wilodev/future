export const DAYS_OF_WEEK = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const daysOfWeekStartingFrom = (startIndex: number = 0) =>
  DAYS_OF_WEEK.slice(startIndex).concat(DAYS_OF_WEEK.slice(0, startIndex));

export const daysOfWeekStartingMonday = () => daysOfWeekStartingFrom(1);
