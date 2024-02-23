import generateUniqueId from './generateUniqueId';

describe('generateUniqueId', () => {
  it('returns a unique string of 27 characters in length', () => {
    expect(generateUniqueId().length).toBe(27);
  });
});
