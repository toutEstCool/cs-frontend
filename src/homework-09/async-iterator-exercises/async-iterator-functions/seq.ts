import type { ExtractAsyncIterablesType } from '../../async-iterator.types';

export default function seq<T extends AsyncIterable<any>[]>(
  ...asyncIterables: T
): AsyncIterableIterator<ExtractAsyncIterablesType<T>> {
  let index = 0;
  let currentAsyncIterator: AsyncIterator<ExtractAsyncIterablesType<T>> | null = null;

  return {
    async next() {
      return new Promise((resolve, reject) => {
        if (index >= asyncIterables.length) {
          resolve({ done: true, value: undefined });
          return;
        }

        if (currentAsyncIterator === null) {
          currentAsyncIterator = asyncIterables[index][Symbol.asyncIterator]();
        }

        currentAsyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              currentAsyncIterator = null;
              index += 1;
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
