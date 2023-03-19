export default async function* map<T, M>(
  asyncIterable: AsyncIterable<T>,
  mapper: (element: T, index: number, asyncIterable: AsyncIterable<T>) => M,
): AsyncGenerator<M> {
  let index = 0;

  for await (const value of asyncIterable) {
    yield mapper(value, index, asyncIterable);
    index += 1;
  }
}
