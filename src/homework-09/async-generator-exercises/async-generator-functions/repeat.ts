export default async function* repeat<T>(getAsyncIterable: () => AsyncIterable<T>): AsyncGenerator<T, void, undefined> {
  let asyncIterable = getAsyncIterable();

  while (true) {
    yield* asyncIterable;

    asyncIterable = getAsyncIterable();
  }
}
