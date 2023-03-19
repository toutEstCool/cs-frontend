export default async function* every(asyncIterable, predicate) {
  for await (const value of asyncIterable) {
    if (!predicate(value)) break;
    yield value;
  }
}
