import { setImmediateBrowser, clearImmediateBrowser } from './set-immediate';

describe('setImmediate function naive implementation', () => {
  it('setImmediate must schedule callback execution at the end of a tick', (done) => {
    const results: number[] = [];

    results.push(1);

    setTimeout(() => {
      results.push(2);
    }, 0);

    setImmediateBrowser((value) => {
      try {
        results.push(value);
        expect(results).toEqual([1, 5, 3]);
        done();
      } catch (testError) {
        done(testError);
      }
    }, 3);

    Promise.resolve(4).then((value) => {
      results.push(value);
    });

    results.push(5);
  });

  it('clearImmediate must prevent scheduled callback execution', (done) => {
    const results: number[] = [];

    results.push(1);

    setTimeout(() => {
      try {
        results.push(2);
        expect(results).toEqual([1, 5, 4, 2]);
        done();
      } catch (testError) {
        done(testError);
      }
    }, 0);

    const immediate = setImmediateBrowser((value) => {
      results.push(value);
    }, 3);

    Promise.resolve(4).then((value) => {
      results.push(value);
    });

    results.push(5);

    clearImmediateBrowser(immediate);
  });
});
