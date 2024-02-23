import { afterEach, describe, test } from '@jest/globals';
import { by, element, expect } from 'detox';

import { MockServerContext, startMockServer } from '../mockServer';
import { launchAppSetup, isIOS } from '../utils';

describe('learning reminders', () => {
  let mockServerContext: MockServerContext | undefined;

  afterEach(() => mockServerContext?.server.stop());

  test('turning on learning reminders for specific days of the week', async () => {
    mockServerContext = await startMockServer(store => ({
      Query: {
        currentUser: () => store.get('User', 1),
      },
    }));

    const { mockStore } = mockServerContext;

    mockStore.set('User', 1, 'activeCourseEnrolments', [mockStore.get('CourseEnrolment', 1)]);

    await launchAppSetup({ permissions: { notifications: 'YES' } });

    await element(by.id('account-button')).tap();
    await element(by.text('Learning reminders')).tap();

    await element(by.id('useReminders')).tap();
    await element(by.id('monday')).tap();
    await element(by.id('wednesday')).tap();
    await element(by.id('learning-reminders-form')).scrollTo('bottom');
    await element(by.id('sunday')).tap();

    if (isIOS()) {
      await element(by.text('Time')).tap();
      await expect(element(by.type('UIDatePicker'))).toBeVisible();
      await element(by.type('UIDatePicker')).setDatePickerDate(
        '2022-03-02T17:00:00',
        "yyyy-MM-dd'T'HH:mm:ss",
      );
    }

    await element(by.id(isIOS() ? 'done-text-button' : 'done-icon-button')).tap();

    await expect(element(by.text('All done!'))).toBeVisible();
    await expect(
      element(
        by.text(
          `You’re all set up to receive reminders on Monday, Wednesday and Sunday at ${
            isIOS() ? '5:00 pm' : '12:00 PM'
          }.`,
        ),
      ),
    ).toBeVisible();

    await element(by.text('Finish')).tap();

    await element(by.text('Learning reminders')).tap();
    await expect(element(by.id('useReminders'))).toHaveToggleValue(true);
  });
});
