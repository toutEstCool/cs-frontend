export default async function* take<T>(asyncIterable: AsyncIterable<T>, takesCount: number): AsyncGenerator<T> {
  let iterationsCount = 0;

  for await (const value of asyncIterable) {
    if (iterationsCount >= takesCount) break;

    yield value;
    iterationsCount += 1;
  }
}
