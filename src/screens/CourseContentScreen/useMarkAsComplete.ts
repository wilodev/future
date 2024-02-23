import useToast from '~/utils/useToast';

import { CourseContentStep } from '.';
import { useStepProgressQuery } from './StepProgressQuery.generated';
import { useStepProgressCompleteMutation } from './StepProgressCompleteMutation.generated';
import { useStepProgressUndoMutation } from './StepProgressUndoMutation.generated';

export default function useMarkAsComplete(
  enrolmentId: string,
  { id: stepId, number: stepNumber }: Pick<CourseContentStep, 'id' | 'number'>,
) {
  const { data } = useStepProgressQuery({
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    variables: { enrolmentId, stepId },
  });

  const [stepProgressComplete] = useStepProgressCompleteMutation();
  const [stepProgressUndo] = useStepProgressUndoMutation();

  const { showToast } = useToast();
  const showError = (message: string) => showToast(message, { duration: 4500 });

  const stepProgress = data?.courseEnrolment?.stepProgress;
  const isComplete = !!stepProgress?.lastCompletedAt;

  const complete = () =>
    stepProgressComplete({
      variables: { stepId },
      optimisticResponse: stepProgress && {
        stepProgressComplete: {
          stepProgress: { ...stepProgress, lastCompletedAt: new Date().toISOString() },
        },
      },
      onError: () =>
        showError(`Could not mark step ${stepNumber} as complete. Your device may be offline.`),
    });

  const undo = () =>
    stepProgressUndo({
      variables: { stepId },
      optimisticResponse: stepProgress && {
        stepProgressUndo: {
          stepProgress: { ...stepProgress, lastCompletedAt: null },
        },
      },
      onError: () =>
        showError(`Could not unmark step ${stepNumber} as complete. Your device may be offline.`),
    });

  return { isComplete, complete, undo };
}
