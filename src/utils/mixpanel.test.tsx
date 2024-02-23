import { render } from '@testing-library/react-native';
import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { Mixpanel } from 'mixpanel-react-native';
import React from 'react';

import generateUniqueId from './generateUniqueId';
import { DISTINCT_ID_KEY, initializeMixpanel, MixpanelContext, withMixpanel } from './mixpanel';

const GENERATED_DISTINCT_ID = 'new-distinct-id';
const MIXPANEL_TOKEN = 'mixpanel-token-abc';
const MIXPANEL_SERVER_URL = 'https://mixpanel.example.com/';

jest.mock('expo-secure-store');
jest.mock('mixpanel-react-native');
jest.mock('react-native-config', () => ({
  MIXPANEL_TOKEN,
  MIXPANEL_SERVER_URL,
}));

jest.mock('./generateUniqueId', () => jest.fn(() => GENERATED_DISTINCT_ID));

describe('initializeMixpanel', () => {
  const setStoredId = (id: string | null) =>
    (getItemAsync as jest.MockedFunction<typeof getItemAsync>).mockResolvedValue(id);

  it('initializes the mixpanel instance with the Mixpanel token', async () => {
    await initializeMixpanel();
    expect(Mixpanel).toHaveBeenCalledWith(MIXPANEL_TOKEN, true);
  });

  it('tries to get the distinct ID from storage', async () => {
    await initializeMixpanel();
    expect(getItemAsync).toBeCalledWith(DISTINCT_ID_KEY);
  });

  it('sets the server URL', async () => {
    const mixpanel = await initializeMixpanel();
    expect(mixpanel.setServerURL).toHaveBeenCalledWith(MIXPANEL_SERVER_URL);
  });

  describe('when there is no distinct ID in storage', () => {
    beforeEach(() => setStoredId(null));

    it('generates a new distinct ID', async () => {
      await initializeMixpanel();
      expect(generateUniqueId).toHaveBeenCalled();
    });

    it('stores the new distinct ID', async () => {
      await initializeMixpanel();
      expect(setItemAsync).toHaveBeenCalledWith(DISTINCT_ID_KEY, GENERATED_DISTINCT_ID);
    });

    it('adds the new distinct ID to the Mixpanel instance', async () => {
      const mixpanel = await initializeMixpanel();
      expect(mixpanel.identify).toHaveBeenCalledWith(GENERATED_DISTINCT_ID);
    });
  });

  describe('when there is already a distinct ID in storage', () => {
    const STORED_DISTINCT_ID = 'existing-distinct-id';

    beforeEach(() => setStoredId(STORED_DISTINCT_ID));

    it('does not try to generate a new distinct ID', async () => {
      await initializeMixpanel();
      expect(generateUniqueId).not.toHaveBeenCalled();
    });

    it('does not update the distinct ID in storage', async () => {
      await initializeMixpanel();
      expect(setItemAsync).not.toHaveBeenCalled();
    });

    it('adds the existing distinct ID to the Mixpanel instance', async () => {
      const mixpanel = await initializeMixpanel();
      expect(mixpanel.identify).toHaveBeenCalledWith(STORED_DISTINCT_ID);
    });
  });
});

describe('MixpanelProvider / withMixpanel', () => {
  it('asynchronously initializes a `MixpanelContext` with a single Mixpanel instance', async () => {
    let contextValue: Promise<Mixpanel>;

    const Fixture = withMixpanel(() => (
      <MixpanelContext.Consumer>
        {context => {
          contextValue = context;
          return null;
        }}
      </MixpanelContext.Consumer>
    ));

    const { rerender } = render(<Fixture />);

    expect(typeof (await contextValue!).track).toEqual('function');

    rerender(<Fixture />);

    expect(Mixpanel).toHaveBeenCalledTimes(1);
  });
});
