import type { ExtractAsyncIterablesType } from '../async-iterator-helpers.types.js';

export default function seq<T extends AsyncIterable<any>[]>(
  ...iterables: T
): AsyncIterableIterator<ExtractAsyncIterablesType<T>> {
  let iterablesIndex = 0;
  let currentAsyncIterator: AsyncIterator<ExtractAsyncIterablesType<T>> | null = null;

  return {
    async next(): Promise<IteratorResult<ExtractAsyncIterablesType<T>>> {
      return new Promise((resolve, reject) => {
        if (iterablesIndex >= iterables.length) {
          resolve({ done: true, value: undefined });
          return;
        }

        if (currentAsyncIterator === null) {
          currentAsyncIterator = iterables[iterablesIndex][Symbol.asyncIterator]();
        }

        currentAsyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              currentAsyncIterator = null;
              iterablesIndex += 1;
              resolve(this.next());
            } else {
              resolve({ done: false, value });
            }
          })
          .catch(reject);
      });
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
