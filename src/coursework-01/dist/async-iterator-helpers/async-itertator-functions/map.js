export default function map(iterable, mapper) {
  const asyncIterator = iterable[Symbol.asyncIterator]();
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
