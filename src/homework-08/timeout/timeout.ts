import sleep from '../sleep/sleep';

export default function timeout<T>(promise: Promise<T>, awaitTime: number): Promise<T> {
  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(reject);

    sleep(awaitTime).then(() => reject(new Error('Timeout')));
  });
}
