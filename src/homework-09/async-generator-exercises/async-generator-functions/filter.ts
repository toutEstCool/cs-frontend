/* eslint-disable no-await-in-loop */
export default async function* filter<T>(
  asyncIterable: AsyncIterable<T>,
  predicate: (element: T, index: number, asyncIterable: AsyncIterable<T>) => boolean,
): AsyncGenerator<T> {
  let index = 0;

  for await (const value of asyncIterable) {
    if (predicate(value, index, asyncIterable)) {
      yield value;
      index += 1;
    }
  }
}
