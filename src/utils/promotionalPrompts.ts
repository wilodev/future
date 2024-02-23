import AsyncStorage from '@react-native-async-storage/async-storage';

export enum PromptKey {
  LearningReminders = 'LearningReminders',
}

export const storageKey = (promptKey: PromptKey) => `PromptLastShown_${promptKey}`;

export const markAsShown = async (promptKey: PromptKey): Promise<void> => {
  await AsyncStorage.setItem(storageKey(promptKey), Date.now().toString(10));
};

export const hasBeenShown = async (promptKey: PromptKey, since?: Date): Promise<boolean> => {
  const dateLastShown = await AsyncStorage.getItem(storageKey(promptKey));
  if (!dateLastShown) {
    return false;
  }
  return since ? new Date(dateLastShown) > since : true;
};
