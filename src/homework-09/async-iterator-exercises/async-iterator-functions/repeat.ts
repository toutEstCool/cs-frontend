export default function repeat<T>(getAsyncIterable: () => AsyncIterable<T>): AsyncIterableIterator<T> {
  let asyncIterator = getAsyncIterable()[Symbol.asyncIterator]();

  return {
    async next() {
      return new Promise((resolve, reject) => {
        asyncIterator
          .next()
          .then(({ done, value }) => {
            if (done) {
              asyncIterator = getAsyncIterable()[Symbol.asyncIterator]();
              resolve(this.next());
            } else {
              resolve({ done, value });
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
