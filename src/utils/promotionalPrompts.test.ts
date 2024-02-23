import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasBeenShown, markAsShown, PromptKey, storageKey } from './promotionalPrompts';

describe('markAsShown', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.now());
  });

  it('persists the time shown to async storage', async () => {
    await markAsShown(PromptKey.LearningReminders);
    expect(AsyncStorage.setItem).toBeCalledWith(
      storageKey(PromptKey.LearningReminders),
      Date.now().toString(),
    );
  });
});

describe('hasBeenShown', () => {
  describe('when there is a time last shown for the prompt', () => {
    const DATE_PROMPT_SHOWN = Date.UTC(2022, 2, 3);

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockReturnValue(
        Promise.resolve(new Date(DATE_PROMPT_SHOWN).toISOString()),
      );
    });

    it('attempts to retrieve time last shown from async storage', async () => {
      await hasBeenShown(PromptKey.LearningReminders);
      expect(AsyncStorage.getItem).toBeCalledWith(storageKey(PromptKey.LearningReminders));
    });

    it("returns true if prompt has been shown and no 'since' date specified", async () => {
      const result = await hasBeenShown(PromptKey.LearningReminders);
      expect(result).toBeTruthy();
    });

    it('returns true if prompt was last shown after the date specified', async () => {
      const result = await hasBeenShown(
        PromptKey.LearningReminders,
        new Date(DATE_PROMPT_SHOWN - 1),
      );
      expect(result).toBeTruthy();
    });

    it('returns false if prompt was last shown before the date specified', async () => {
      const result = await hasBeenShown(
        PromptKey.LearningReminders,
        new Date(DATE_PROMPT_SHOWN + 1),
      );
      expect(result).toBeFalsy();
    });
  });

  describe('when there is not a time last shown for the prompt', () => {
    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockReturnValue(Promise.resolve(null));
    });

    it('returns false', async () => {
      const result = await hasBeenShown(PromptKey.LearningReminders);
      expect(result).toBeFalsy();
    });
  });
});
