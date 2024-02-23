import { afterEach, describe, test } from '@jest/globals';
import { by, element, expect } from 'detox';

import { MockServerContext, startMockServer } from '../mockServer';
import { launchAppSetup } from '../utils';

describe('course listing', () => {
  let mockServerContext: MockServerContext | undefined;

  afterEach(() => mockServerContext?.server.stop());

  test('swipe down gesture triggers refresh the course data', async () => {
    mockServerContext = await startMockServer(store => ({
      Query: {
        currentUser: () => store.get('User', 1),
      },
    }));

    const { mockStore } = mockServerContext;

    mockStore.set('User', 1, 'activeCourseEnrolments', [mockStore.get('CourseEnrolment', 1)]);
    mockStore.set('CourseEnrolment', 1, 'run', mockStore.get('Run', 1));
    mockStore.set('Run', 1, 'fullTitle', 'Course title');

    await launchAppSetup();

    await expect(element(by.text('Course title'))).toBeVisible();

    mockStore.set('Run', 1, 'fullTitle', 'Updated title');

    await element(by.text('Course title')).swipe('down');

    await expect(element(by.text('Updated title'))).toBeVisible();
  });
});
