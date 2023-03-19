export default function map<T, M>(
  iterable: AsyncIterable<T>,
  mapper: (element: T, index: number, iterable: AsyncIterable<T>) => M,
): AsyncIterableIterator<M> {
  const asyncIterator = iterable[Symbol.asyncIterator]();
  let index = 0;

  return {
    async next(): Promise<IteratorResult<M>> {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              resolve({ done: true, value: undefined });
            } else {
              resolve({ done: false, value: mapper(value, index, iterable) });
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
