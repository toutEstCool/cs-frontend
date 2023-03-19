import take from './async-generator-functions/take';
import map from './async-generator-functions/map';
import filter from './async-generator-functions/filter';
import seq from './async-generator-functions/seq';
import every from './async-generator-functions/every';
import repeat from './async-generator-functions/repeat';

describe('Implementation of take - iterates over the first N iterations of async iterable', () => {
  it('Take must iterate with provided amount of iterations', async () => {
    async function* asyncTasks() {
      yield* [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    const results: number[] = [];

    for await (const value of take(asyncTasks(), 5)) {
      results.push(value);
    }

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Implementation of map - iterates over the elements of async iterable and applies a provided function to them', () => {
  it('Map must iterate all the elements of async iterable and apply a function to them', async () => {
    async function* asyncTasks() {
      yield* [1, 2, 3, 4, 5];
    }

    const results: number[] = [];

    for await (const value of map(asyncTasks(), (num) => num * 10)) {
      results.push(value);
    }

    expect(results).toEqual([10, 20, 30, 40, 50]);
  });
});

describe('Implementation of filter - iterates over the elements of async iterable, that satisfies the predicate function', () => {
  it('Filter must iterate over the async iterable and skip inappropriate elements', async () => {
    async function* asyncTasks() {
      yield* [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    const results: number[] = [];

    for await (const value of filter(asyncTasks(), (num) => num % 2 === 0)) {
      results.push(value);
    }
  });
});

describe('Implementation of seq - iterates through the all of provided async iterables', () => {
  it('Seq must iterate all the elements of provided async iterables', async () => {
    async function* asyncTasksOne() {
      yield* [1, 2, 3, 4];
    }

    async function* asyncTasksTwo() {
      yield* 'Hello';
    }

    async function executor() {
      const results: (number | string)[] = [];

      for await (const value of seq(asyncTasksOne(), asyncTasksTwo())) {
        results.push(value);
      }

      expect(results).toEqual([1, 2, 3, 4, 'H', 'e', 'l', 'l', 'o']);
    }

    executor();
  });
});

describe('Implementation of every - iterates while predicate function return truthy value', () => {
  it('Every must iterate the iterable and check the predicate value on truthiness', async () => {
    const results: number[] = [];

    async function* asyncTask() {
      yield* [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    for await (const value of every(asyncTask(), (num) => num <= 3)) {
      results.push(value);
    }

    expect(results).toEqual([1, 2, 3]);
  });
});

describe('Implementation of repeat - iterates infinitely...', () => {
  it('Repeat must iterate the iterable till the end and then start it over again', async () => {
    const results: number[] = [];

    async function* asyncTask() {
      yield* [1, 2, 3];
    }

    for await (const value of take(
      repeat(() => asyncTask()),
      7,
    )) {
      results.push(value);
    }

    expect(results).toEqual([1, 2, 3, 1, 2, 3, 1]);
  });
});
