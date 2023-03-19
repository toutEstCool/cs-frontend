import allLimit from './all-limit';

describe('allLimit function implementation', () => {
  it('allLimit function must handle provided promises, limiting maximum number of simultaneously pending promises', (done) => {
    const promises = [1, 2, 3, 4, 5].map(
      (value) =>
        new Promise<number>((resolve) => {
          setTimeout(resolve, value * 100, value);
        }),
    );

    allLimit(promises, 2).then((results) => {
      try {
        expect(results).toEqual([1, 2, 3, 4, 5]);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });
});
