export default function take<T>(asyncIterable: AsyncIterable<T>, takesCount: number): AsyncIterableIterator<T> {
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  let iterationsCount = 0;

  return {
    async next() {
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
