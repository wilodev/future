import FeatureFlags from '~/utils/FeatureFlags';

const COMPLETABLE_STEP_TYPES = [
  'Article',
  'AssignmentReflection',
  'AudioArticle',
  'Discussion',
  'Exercise',
  'GroupReflection',
  'GroupShowcase',
  'PollArticle',
  'TutorMarkedAssignment',
  'VideoArticle',
];

export const showMarkAsComplete = (contentType: string) =>
  FeatureFlags.MARK_AS_COMPLETE && COMPLETABLE_STEP_TYPES.includes(contentType);
