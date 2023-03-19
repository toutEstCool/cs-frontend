export default async function* repeat(getAsyncIterable) {
  let asyncIterable = getAsyncIterable();
  while (true) {
    yield* asyncIterable;
    asyncIterable = getAsyncIterable();
  }
}
