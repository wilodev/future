import { getItemAsync, setItemAsync } from 'expo-secure-store';
import { Mixpanel } from 'mixpanel-react-native';
import React, { createContext, FunctionComponent, useMemo } from 'react';
import Config from 'react-native-config';

import generateUniqueId from './generateUniqueId';

export const DISTINCT_ID_KEY = 'distinct-id';

const getDistinctId = () => getItemAsync(DISTINCT_ID_KEY);

const setNewDistinctId = async () => {
  const newId = generateUniqueId();

  await setItemAsync(DISTINCT_ID_KEY, newId);

  return newId;
};

const mixpanelToken = Config.MIXPANEL_TOKEN ?? '';
const mixpanelServerUrl = Config.MIXPANEL_SERVER_URL ?? '';

export const initializeMixpanel = async () => {
  const mixpanel = new Mixpanel(mixpanelToken, true);

  await mixpanel.init();
  mixpanel.setServerURL(mixpanelServerUrl);
  mixpanel.identify((await getDistinctId()) ?? (await setNewDistinctId()));

  return mixpanel;
};

export const MixpanelContext = createContext<Promise<Mixpanel>>(undefined as never);

export const MixpanelProvider: FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const mixpanelPromise = useMemo(initializeMixpanel, []);

  return <MixpanelContext.Provider value={mixpanelPromise}>{children}</MixpanelContext.Provider>;
};

export const withMixpanel =
  <T,>(Component: FunctionComponent<any>) =>
  (props: T) => (
    <MixpanelProvider>
      <Component {...props} />
    </MixpanelProvider>
  );
