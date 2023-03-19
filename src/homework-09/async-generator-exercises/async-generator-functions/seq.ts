import type { ExtractAsyncIterablesType } from '../../async-iterator.types';

export default async function* seq<T extends AsyncIterable<any>[]>(
  ...asyncIterables: T
): AsyncGenerator<ExtractAsyncIterablesType<T>, void, undefined> {
  for await (const iterable of asyncIterables) {
    yield* iterable;
  }
}
