import take from '../src/async-iterator-helpers/async-itertator-functions/take';
import filter from '../src/async-iterator-helpers/async-itertator-functions/filter';
import map from '../src/async-iterator-helpers/async-itertator-functions/map';
import seq from '../src/async-iterator-helpers/async-itertator-functions/seq';

describe('Implementation of take - iterates over the first N iterations of async iterable', () => {
  it('Take must iterate with provided amount of iterations', (done) => {
    async function* asyncTasks() {
      for (let i = 1; i < 10; i += 1) {
        yield i;
      }
    }

    async function executor() {
      const results: number[] = [];

      for await (const value of take(asyncTasks(), 5)) {
        results.push(value);
      }

      try {
        expect(results).toEqual([1, 2, 3, 4, 5]);
        done();
      } catch (testError) {
        done(testError);
      }
    }

    executor();
  });
});

describe('Implementation of map - iterates over the elements of async iterable and applies a provided function to them', () => {
  it('Map must iterate all the elements of async iterable and apply a function to them', (done) => {
    async function* asyncTasks() {
      for (let i = 1; i <= 5; i += 1) {
        yield i;
      }
    }

    async function executor() {
      const results: number[] = [];

      for await (const value of map(asyncTasks(), (num) => num * 10)) {
        results.push(value);
      }

      try {
        expect(results).toEqual([10, 20, 30, 40, 50]);
        done();
      } catch (testError) {
        done(testError);
      }
    }

    executor();
  });
});

describe('Implementation of filter - iterates over the elements of async iterable, that satisfies the predicate function', () => {
  it('Filter must iterate over the async iterable and skip inappropriate elements', (done) => {
    async function* asyncTasks() {
      for (let i = 1; i < 10; i += 1) {
        yield i;
      }
    }

    async function executor() {
      const results: number[] = [];

      for await (const value of filter(asyncTasks(), (num) => num % 2 === 0)) {
        results.push(value);
      }

      try {
        expect(results).toEqual([2, 4, 6, 8]);
        done();
      } catch (testError) {
        done(testError);
      }
    }

    executor();
  });
});

describe('Implementation of seq - iterates through the all of provided async iterables', () => {
  it('Seq must iterate all the elements of provided async iterables', (done) => {
    async function* asyncTasksOne() {
      for (let i = 1; i < 5; i += 1) {
        yield i;
      }
    }

    async function* asyncTasksTwo() {
      for (const char of 'Hello') {
        yield char;
      }
    }

    async function executor() {
      const results: (number | string)[] = [];

      for await (const value of seq(asyncTasksOne(), asyncTasksTwo())) {
        results.push(value);
      }

      try {
        expect(results).toEqual([1, 2, 3, 4, 'H', 'e', 'l', 'l', 'o']);
        done();
      } catch (testError) {
        done(testError);
      }
    }

    executor();
  });
});
