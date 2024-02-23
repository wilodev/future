import { afterAll, beforeAll, describe, test } from '@jest/globals';
import { by, device, element, expect } from 'detox';

import { launchAppSetup, isIOS } from '../utils';
import { MockServerContext, startMockServer } from '../mockServer';

describe('authentication', () => {
  let mockServerContext: MockServerContext | undefined;

  beforeAll(async () => {
    mockServerContext = await startMockServer(store => ({
      Query: {
        currentUser: () => store.get('User', 'user-1'),
      },
      Mutation: {
        userAuthenticate: () => ({ token: 'example-token', errors: [] }),
      },
    }));

    mockServerContext.mockStore.set('User', 'user-1', 'email', 'example@example.com');
  });

  afterAll(() => mockServerContext?.server.stop());

  test('launching the app and signing in', async () => {
    await device.clearKeychain();
    await launchAppSetup({ delete: true }, false);

    await expect(element(by.id('email-input'))).toExist();
    await element(by.id('email-input')).typeText('h@h.com');
    await element(by.id('password-input')).typeText('password123');

    if (!isIOS()) {
      await device.pressBack();
    }
    await expect(element(by.id('sign-in-button'))).toExist();
    await element(by.id('sign-in-button')).tap();

    await expect(element(by.text('Courses')).atIndex(1)).toExist();
  });

  test('launching the app after having already signed in', async () => {
    await launchAppSetup({ newInstance: true }, false);
    await expect(element(by.text('Courses')).atIndex(1)).toExist();
  });

  test('opening the account screen and signing out', async () => {
    await element(by.id('account-button')).tap();
    await expect(element(by.text('Signed in as example@example.com'))).toBeVisible();

    await element(by.text('Sign out')).tap();
    await expect(element(by.id('sign-in-button'))).toExist();
  });
});
