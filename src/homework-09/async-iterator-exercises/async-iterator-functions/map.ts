export default function map<T, M>(
  asyncIterable: AsyncIterable<T>,
  mapper: (element: T, index: number, asyncIterable: AsyncIterable<T>) => M,
): AsyncIterableIterator<M> {
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
            } else {
              resolve({ done: false, value: mapper(value, index, asyncIterable) });
              index += 1;
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
