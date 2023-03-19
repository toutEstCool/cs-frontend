export default function seq(...iterables) {
  let iterableCount = 0;
  let currentIterator = null;
  return {
    next() {
      if (iterableCount >= iterables.length) return { done: true, value: undefined };
      if (currentIterator === null) {
        currentIterator = iterables[iterableCount][Symbol.iterator]();
      }
      const { done, value } = currentIterator.next();
      if (done) {
        iterableCount += 1;
        currentIterator = null;
        return this.next();
      }
      return { done: false, value };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}
