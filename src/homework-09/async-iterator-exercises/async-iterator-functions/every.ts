export default function every<T>(
  asyncIterable: AsyncIterable<T>,
  predicate: (value: T) => boolean,
): AsyncIterableIterator<T> {
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();

  return {
    async next() {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done || !predicate(value)) {
              resolve({ done: true, value: undefined });
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
