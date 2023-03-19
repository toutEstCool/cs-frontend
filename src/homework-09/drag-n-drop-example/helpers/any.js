export default function any(...asyncIterables) {
  const asyncIterators = asyncIterables.map((iterable) => iterable[Symbol.asyncIterator]());
  return {
    async next() {
      return Promise.race(asyncIterators.map((iterator) => iterator.next()));
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
