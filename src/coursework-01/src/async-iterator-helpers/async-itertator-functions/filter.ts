export default function filter<T>(
  iterable: AsyncIterable<T>,
  predicate: (element: T, index: number, iterable: AsyncIterable<T>) => boolean,
): AsyncIterableIterator<T> {
  const asyncIterator = iterable[Symbol.asyncIterator]();
  let index = 0;

  return {
    async next(): Promise<IteratorResult<T>> {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              resolve({ done: true, value: undefined });
              return;
            }

            if (predicate(value, index, iterable)) {
              resolve({ done: false, value });
              index += 1;
              return;
            }

            resolve(this.next());
          })
          .catch(reject);
      });
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
