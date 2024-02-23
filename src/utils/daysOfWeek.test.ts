import { daysOfWeekStartingFrom } from './daysOfWeek';

describe('daysOfWeekStartingFrom', () => {
  it('returns the days of the week starting on the specified day', () => {
    expect(daysOfWeekStartingFrom(3)).toEqual([
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
      'monday',
      'tuesday',
    ]);
  });
});
