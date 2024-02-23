import { Mixpanel } from 'mixpanel-react-native';
import { useContext, useMemo } from 'react';

import { initializeMixpanel, MixpanelContext } from './mixpanel';

export type TrackFunction = (
  eventName: string,
  area: EventArea,
  properties?: EventProperties,
) => Promise<void>;

type EventProperties = { [key: string]: any };
type EventArea = 'Account' | 'Course' | 'CourseList' | 'Reminders' | 'Video';

export const useAnalytics = (): { track: TrackFunction } => {
  const mixpanelPromise = useContext(MixpanelContext);

  return {
    track: useMemo(() => trackFunction(mixpanelPromise), [mixpanelPromise]),
  };
};

export const createStandaloneTrackFunction = (): TrackFunction =>
  trackFunction(initializeMixpanel());

const trackFunction =
  (mixpanelPromise: Promise<Mixpanel>): TrackFunction =>
  async (eventName, area, properties?) => {
    const mixpanel = await mixpanelPromise;
    mixpanel.track(eventName, { area, ...properties });
  };
