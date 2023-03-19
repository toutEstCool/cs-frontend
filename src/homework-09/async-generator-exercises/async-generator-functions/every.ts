export default async function* every<T>(
  asyncIterable: AsyncIterable<T>,
  predicate: (value: T) => boolean,
): AsyncGenerator<T> {
  for await (const value of asyncIterable) {
    if (!predicate(value)) break;
    yield value;
  }
}
