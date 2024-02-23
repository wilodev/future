import { capitalize, joinAsSentence } from './text';

describe('capitalize', () => {
  it('capitalizes the first letter of the string', () => {
    expect(capitalize('red bus')).toEqual('Red bus');
  });
});

describe('joinAsSentence', () => {
  it('returns an empty string when list is empty', () => {
    expect(joinAsSentence([])).toEqual('');
  });

  it('returns the item when list contains only one item', () => {
    expect(joinAsSentence(['red'])).toEqual('red');
  });

  it('returns the items as a sentence when the list contains more than two items', () => {
    expect(joinAsSentence(['red', 'blue'])).toEqual('red and blue');
    expect(joinAsSentence(['red', 'green', 'blue'])).toEqual('red, green and blue');
  });
});
