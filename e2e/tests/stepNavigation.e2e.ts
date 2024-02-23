import { afterAll, beforeAll, describe, test } from '@jest/globals';
import { by, element, expect, waitFor } from 'detox';

import { MockServerContext, startMockServer } from '../mockServer';
import { launchAppSetup, isIOS } from '../utils';

describe('step navigation', () => {
  let mockServerContext: MockServerContext | undefined;

  beforeAll(async () => {
    mockServerContext = await startMockServer(store => ({
      Query: {
        contentByStepId: (_, { id }) => store.get('Article', `article-for-${id}`),
        step: (_, { id }) => store.get('Step', id),
        currentUser: () => store.get('User', 'user-1'),
        run: (_, { id }) => store.get('Run', id),
        courseEnrolment: (_, { id }) => store.get('CourseEnrolment', id),
      },
      Run: {
        can: () => true,
        imageUrl: () => 'https://www.example.com/image.jpg',
      },
    }));

    const { mockStore } = mockServerContext;

    const ACTIVITIES_PER_WEEK = 5;
    const STEPS_PER_ACTIVITY = 3;
    const STEPS_PER_WEEK = ACTIVITIES_PER_WEEK * STEPS_PER_ACTIVITY;
    const WEEK_COUNT = 3;
    const ACTIVITY_COUNT = WEEK_COUNT * ACTIVITIES_PER_WEEK;
    const STEP_COUNT = WEEK_COUNT * STEPS_PER_WEEK;

    mockStore.set('User', 'user-1', 'activeCourseEnrolments', [
      mockStore.get('CourseEnrolment', 'enrolment-1'),
    ]);

    mockStore.set('CourseEnrolment', 'enrolment-1', {
      run: mockStore.get('Run', 'run-1'),
      accessIsExpired: false,
    });

    mockStore.set('Run', 'run-1', {
      fullTitle: 'Example course title',
      weeks: [...Array(WEEK_COUNT)].map((_, weekIndex) =>
        mockStore.get('Week', `week-${weekIndex + 1}`),
      ),
      isStarted: true,
    });

    for (let weekNumber = 1; weekNumber <= WEEK_COUNT; weekNumber++) {
      const id = `week-${weekNumber}`;

      mockStore.set('Week', id, {
        id,
        number: weekNumber,
        title: `Example week title ${weekNumber}`,
        activities: [...Array(ACTIVITIES_PER_WEEK)].map((_, activityIndex) =>
          mockStore.get(
            'Activity',
            `activity-${(weekNumber - 1) * ACTIVITIES_PER_WEEK + activityIndex + 1}`,
          ),
        ),
      });
    }

    for (let activityNumber = 1; activityNumber <= ACTIVITY_COUNT; activityNumber++) {
      const id = `activity-${activityNumber}`;
      mockStore.set('Activity', id, {
        id,
        title: `Example activity title ${activityNumber}`,
        steps: [...Array(STEPS_PER_ACTIVITY)].map((_, stepIndex) =>
          mockStore.get(
            'Step',
            `step-${(activityNumber - 1) * STEPS_PER_ACTIVITY + stepIndex + 1}`,
          ),
        ),
      });
    }

    for (let stepNumber = 1; stepNumber <= STEP_COUNT; stepNumber++) {
      const id = `step-${stepNumber}`;

      const weekStepIndex = ((stepNumber - 1) % STEPS_PER_WEEK) + 1;
      const weekNumber = (stepNumber - weekStepIndex) / STEPS_PER_WEEK + 1;

      mockStore.set('Step', id, {
        id,
        number: `${weekNumber}.${weekStepIndex}`,
        title: `Example step title ${stepNumber}`,
        shortStepTypeLabel: 'article',
        previousStep: stepNumber > 1 ? mockStore.get('Step', `step-${stepNumber - 1}`) : undefined,
        nextStep:
          stepNumber < STEP_COUNT ? mockStore.get('Step', `step-${stepNumber + 1}`) : undefined,
      });

      mockStore.set('Article', `article-for-${id}`, {
        bodyForMobileApp:
          `<p>Article ${stepNumber} content</p>` +
          '<p>The quick brown fox jumps over the lazy dog</p>'.repeat(50),
        copyrightForMobileApp: '<p>copyright</p>',
      });
    }

    await launchAppSetup();
  });

  afterAll(() => mockServerContext?.server.stop());

  const stepInToDoList = (stepNumber: number) =>
    element(by.text(`Example step title ${stepNumber}`).withAncestor(by.id('to-do-list')));

  const scrollViewForStep = (stepNumber: number) =>
    element(by.id(`step-scroll-view-step-${stepNumber}`));

  test('drill down into an article step', async () => {
    await expect(element(by.text('Example course title'))).toBeVisible();
    await element(by.text('Example course title')).tap();

    await expect(element(by.text('Example course title'))).toBeVisible();
    await element(by.id('to-do-icon')).tap();

    await expect(stepInToDoList(1)).toBeVisible();
    await stepInToDoList(1).tap();

    await expect(element(by.text('Article 1 content'))).toBeVisible();
  });

  test('navigate between steps using the linear navigation bar', async () => {
    await element(by.id('next-button')).tap();

    await expect(element(by.text('Example step title 2'))).toBeVisible();
    await expect(element(by.text('Article 2 content'))).toBeVisible();

    await element(by.id('previous-button')).tap();

    await expect(element(by.text('Example step title 1'))).toBeVisible();
    await expect(element(by.text('Article 1 content'))).toBeVisible();
  });

  test('navigating between steps using swipe gestures', async () => {
    await scrollViewForStep(1).swipe('left');

    await expect(element(by.text('Example step title 2'))).toBeVisible();
    await expect(element(by.text('Article 2 content'))).toBeVisible();

    await scrollViewForStep(2).swipe('right');

    await expect(element(by.text('Example step title 1'))).toBeVisible();
    await expect(element(by.text('Article 1 content'))).toBeVisible();
  });

  if (isIOS()) {
    test('navigate back to the course list using extreme swipe left gesture', async () => {
      await scrollViewForStep(1).swipe('right', 'fast', 0.5, 0);
      await expect(element(by.text('Example course title'))).toBeVisible();

      await element(by.id('to-do-icon')).tap();
      await stepInToDoList(1).tap();
    });
  }

  test('navigate between steps using the ToDo modal from within a step', async () => {
    await element(by.id('to-do-icon').withAncestor(by.id('step-screen-header'))).tap();

    await element(by.id('to-do-list')).swipe('up', 'slow', isIOS() ? 0.2 : 0.7);
    await expect(stepInToDoList(6)).toBeVisible();
    await stepInToDoList(6).multiTap(2);

    await waitFor(element(by.text('Article 6 content')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('to-do-icon').withAncestor(by.id('step-screen-header'))).tap();
    await expect(stepInToDoList(5)).toBeVisible();

    await stepInToDoList(8).multiTap(2);
    await expect(element(by.text('Article 8 content'))).toBeVisible();
  });

  test('scrolling down and up the screen on a step with long content', async () => {
    const linearNavigationBar = element(by.id('linear-navigation-bar'));

    await expect(linearNavigationBar).toBeVisible();

    await scrollViewForStep(8).scroll(300, 'down', 0.5, 0.5);
    await expect(linearNavigationBar).not.toBeVisible();

    await scrollViewForStep(8).scroll(100, 'up', 0.5, 0.5);
    await expect(linearNavigationBar).toBeVisible();

    await scrollViewForStep(8).scroll(100, 'down', 0.5, 0.5);
    await expect(linearNavigationBar).not.toBeVisible();

    await waitFor(linearNavigationBar)
      .toBeVisible()
      .whileElement(by.id('step-scroll-view-step-8'))
      .scroll(100, 'up', 0.5, 0.5);
  });

  test('navigate back to the course cover page using the back button in the navigation bar', async () => {
    await element(by.id('header-back').withAncestor(by.id('step-screen-header'))).tap();
    await expect(element(by.text('Example course title'))).toBeVisible();
  });
});
