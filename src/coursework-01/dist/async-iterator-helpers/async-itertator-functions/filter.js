export default function filter(iterable, predicate) {
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
