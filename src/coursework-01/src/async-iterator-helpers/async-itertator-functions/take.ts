export default function take<T>(iterable: AsyncIterable<T>, takesCount: number): AsyncIterableIterator<T> {
  const asyncIterator = iterable[Symbol.asyncIterator]();
  let iterationsCount = 0;

  return {
    async next(): Promise<IteratorResult<T>> {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done || iterationsCount >= takesCount) {
              resolve({ done: true, value: undefined });
            } else {
              resolve({ done: false, value });
              iterationsCount += 1;
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
