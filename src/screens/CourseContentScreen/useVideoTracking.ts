import { useCallback, useRef } from 'react';
import { OnProgressData } from 'react-native-video';
import { useAnalytics } from '~/utils/analytics';

export default function useVideoTracking({ runId, stepId }: { runId: string; stepId: string }) {
  const { track } = useAnalytics();
  const isVideoStartTracked = useRef(false);
  const isVideoPlayedPercentTracked = useRef(false);

  const trackVideoStart = useCallback(() => {
    if (!isVideoStartTracked.current) {
      isVideoStartTracked.current = true;
      track('Started video', 'Video', {
        run_id: runId,
        step_id: stepId,
      });
    }
  }, [runId, stepId, track]);

  const trackVideoPercentagePlayed = useCallback(
    ({ currentTime, seekableDuration }: OnProgressData) => {
      const PERCENTAGE_PLAYED = 75;
      const currentPlayedPercentage = Math.round((currentTime / seekableDuration) * 100);

      if (!isVideoPlayedPercentTracked.current && PERCENTAGE_PLAYED <= currentPlayedPercentage) {
        isVideoPlayedPercentTracked.current = true;

        track('Video percentage played', 'Video', {
          run_id: runId,
          step_id: stepId,
          step_type: 'Video',
          percentage: PERCENTAGE_PLAYED,
        });
      }
    },
    [runId, stepId, track],
  );

  return { trackVideoStart, trackVideoPercentagePlayed };
}
