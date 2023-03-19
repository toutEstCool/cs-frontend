export default async function* seq(...asyncIterables) {
  for await (const iterable of asyncIterables) {
    yield* iterable;
  }
}
