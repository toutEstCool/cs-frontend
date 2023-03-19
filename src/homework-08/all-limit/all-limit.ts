import cast from '../../utils/common.utils';

export default function allLimit<T>(iterable: Iterable<T>, maxPending: number): Promise<Awaited<T>[]> {
  if (typeof iterable[Symbol.iterator] !== 'function') {
    throw new TypeError('Object is not iterable');
  }

  return new Promise((resolve, reject) => {
    let iteratorCount = 0;
    let pendingCount = 0;
    let isDone: boolean | undefined = false;
    const promiseResults: Awaited<T>[] = [];

    const handler = (iterator: Iterator<T>): void => {
      if (pendingCount >= maxPending) return;

      const { done, value } = iterator.next();
      isDone = done;
      if (done) {
        if (iteratorCount === 0) resolve(promiseResults);
        return;
      }

      const index = iteratorCount;
      iteratorCount += 1;
      pendingCount += 1;

      Promise.resolve(value).then(
        (result) => {
          promiseResults[index] = cast<Awaited<T>>(result);
          pendingCount -= 1;

          if (isDone && promiseResults.length === iteratorCount) {
            resolve(promiseResults);
          } else {
            handler(iterator);
          }
        },
        (reason) => {
          reject(reason);
        },
      );

      handler(iterator);
    };

    handler(iterable[Symbol.iterator]());
  });
}
