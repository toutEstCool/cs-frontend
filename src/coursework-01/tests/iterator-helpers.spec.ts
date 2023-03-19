import seq from '../src/iterator-helpers/seq';

describe('Implementation of seq - iterates through the all of provided iterables', () => {
  it('Seq must iterate all the elements of provided collections', () => {
    const numbers = [1, 2, 3];
    const string = 'Foo';
    const set = new Set([true, false]);

    expect([...seq(numbers, string, set)]).toEqual([1, 2, 3, 'F', 'o', 'o', true, false]);
  });
});
