import type { ExtractAsyncIterablesType } from '../../async-iterator.types';

export default function any<T extends AsyncIterable<any>[]>(
  ...asyncIterables: T
): AsyncIterableIterator<ExtractAsyncIterablesType<T>> {
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
