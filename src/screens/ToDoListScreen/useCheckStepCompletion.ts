import { useMemo, useCallback } from 'react';
import { useStepProgressesQuery } from '~/screens/ToDoListScreen/StepProgressessQuery.generated';

export default function useCheckStepCompletion(enrolmentId: string) {
  const { data } = useStepProgressesQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    variables: { enrolmentId },
  });

  const completedSteps = useMemo(() => {
    const completedProgresses =
      data?.courseEnrolment?.stepProgresses?.filter(item => item.lastCompletedAt !== null) || [];

    return new Set(completedProgresses.map(progress => progress.step.id) || []);
  }, [data]);

  const stepIsComplete = useCallback(
    (stepId: string) => completedSteps.has(stepId),
    [completedSteps],
  );

  return { stepIsComplete };
}
