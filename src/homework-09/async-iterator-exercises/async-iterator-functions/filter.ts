export default function filter<T>(
  asyncIterable: AsyncIterable<T>,
  predicate: (element: T, index: number, asyncIterable: AsyncIterable<T>) => boolean,
): AsyncIterableIterator<T> {
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  let index = 0;

  return {
    async next() {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              resolve({ done: true, value: undefined });
              return;
            }

            if (predicate(value, index, asyncIterable)) {
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
