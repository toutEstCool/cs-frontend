export default async function* filter(asyncIterable, predicate) {
  let index = 0;
  for await (const value of asyncIterable) {
    if (predicate(value, index, asyncIterable)) {
      yield value;
      index += 1;
    }
  }
}
