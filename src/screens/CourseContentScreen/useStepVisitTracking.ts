import { useEffect, useRef } from 'react';
import { CourseContentItem } from '.';
import { useStepVisitTrackMutation } from './StepVisitTrackMutation.generated';

export default function (currentItem?: CourseContentItem) {
  const timeoutRef = useRef<number>();

  const [stepVisitTrack] = useStepVisitTrackMutation();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (
      currentItem?.itemType === 'Step' &&
      (currentItem.contentType === 'Article' || currentItem.contentType === 'VideoArticle')
    ) {
      const STEP_VISIT_TRACK_DELAY = 5000;

      const asyncStepVisitTrack = () => {
        const visitedAt = new Date(Date.now()).toISOString();

        stepVisitTrack({
          variables: { stepId: currentItem.id, visitedAt },
          onError: error => console.warn('stepVisitTrack raised error', error),
          context: { retry: true },
        });
      };

      timeoutRef.current = setTimeout(asyncStepVisitTrack, STEP_VISIT_TRACK_DELAY) as any;
    }

    return () => clearTimeout(timeoutRef.current);
  }, [currentItem, stepVisitTrack]);
}
