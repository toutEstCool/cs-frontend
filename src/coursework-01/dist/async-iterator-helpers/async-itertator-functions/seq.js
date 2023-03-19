export default function seq(...iterables) {
  let iterablesIndex = 0;
  let currentAsyncIterator = null;
  return {
    async next() {
      return new Promise((resolve, reject) => {
        if (iterablesIndex >= iterables.length) {
          resolve({ done: true, value: undefined });
          return;
        }
        if (currentAsyncIterator === null) {
          currentAsyncIterator = iterables[iterablesIndex][Symbol.asyncIterator]();
        }
        currentAsyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              currentAsyncIterator = null;
              iterablesIndex += 1;
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
