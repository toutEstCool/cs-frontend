import type { ThunkValue, Promisified } from './promisify.types';

export default function promisify<T extends (...args: any[]) => void>(fn: T): Promisified<T> {
  return function promisified(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error: Error, value: ThunkValue<T>) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  };
}
