import cast from '../../utils/common.utils';
import isPromiseLike from './sync-promise.utils';
import SyncAggregateError from './aggregate-error';

import {
  SyncPromiseStatus,
  Handler,
  Resolve,
  Reject,
  OnFulfilled,
  OnRejected,
  OnFinalized,
} from './sync-promise.types';

export default class SyncPromise<T> implements PromiseLike<T> {
  #status: SyncPromiseStatus = SyncPromiseStatus.Pending;

  #result: T;

  #handlers: Handler<T, any>[] = [];

  static resolve<T>(value: T | PromiseLike<T>): SyncPromise<T> {
    return new SyncPromise((resolve) => {
      resolve(value);
    });
  }

  static reject<R = never>(reason?: any): SyncPromise<R> {
    return new SyncPromise((_, reject) => {
      reject(reason);
    });
  }

  static all<T>(iterable: Iterable<T>): SyncPromise<Awaited<T>[]> {
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new TypeError('Object is not iterable');
    }

    return new SyncPromise((resolve, reject) => {
      let iterableCounter = 0;
      let resolvedCounter = 0;
      const results: Awaited<T>[] = [];
      const iterator = iterable[Symbol.iterator]();

      let { done, value } = iterator.next();
      let isDone = done;
      if (done && iterableCounter === 0) resolve(results);

      while (!done) {
        const index = iterableCounter;
        iterableCounter += 1;

        SyncPromise.resolve(value).then(
          (result) => {
            results[index] = cast<Awaited<T>>(result);
            resolvedCounter += 1;
            if (isDone && resolvedCounter === iterableCounter) resolve(results);
          },
          (reason) => {
            reject(reason);
          },
        );

        ({ done, value } = iterator.next());
        isDone = done;
      }
    });
  }

  static race<T>(iterable: Iterable<T>): SyncPromise<Awaited<T>> {
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new TypeError('Object is not iterable');
    }

    return new SyncPromise((resolve, reject) => {
      for (const value of iterable) {
        SyncPromise.resolve(value).then((result) => {
          resolve(cast<Awaited<T>>(result));
        }, reject);
      }
    });
  }

  static allSettled<T>(iterable: Iterable<T>): SyncPromise<PromiseSettledResult<Awaited<T>>[]> {
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new TypeError('Object is not iterable');
    }

    return new SyncPromise((resolve) => {
      let iterableCounter = 0;
      let handledCounter = 0;
      const results: PromiseSettledResult<Awaited<T>>[] = [];
      const iterator = iterable[Symbol.iterator]();

      let { done, value } = iterator.next();
      let isDone = done;
      if (done && iterableCounter === 0) resolve(results);

      while (!done) {
        const index = iterableCounter;
        iterableCounter += 1;

        SyncPromise.resolve(value)
          .then(
            (result) => {
              results[index] = { status: 'fulfilled', value: cast<Awaited<T>>(result) };
            },
            (reason) => {
              results[index] = { status: 'rejected', reason };
            },
          )
          .finally(() => {
            handledCounter += 1;
            if (isDone && handledCounter === iterableCounter) resolve(results);
          });

        ({ done, value } = iterator.next());
        isDone = done;
      }
    });
  }

  static any<T>(iterable: Iterable<T>): SyncPromise<Awaited<T>> {
    if (typeof iterable[Symbol.iterator] !== 'function') {
      throw new TypeError('Object is not iterable');
    }

    return new SyncPromise((resolve, reject) => {
      let iterableCounter = 0;
      let rejectedCounter = 0;
      const reasons: any[] = [];
      const iterator = iterable[Symbol.iterator]();

      let { done, value } = iterator.next();
      let isDone = done;
      if (done && iterableCounter === 0) reject(new SyncAggregateError('All promises were rejected', reasons));

      while (!done) {
        const index = iterableCounter;
        iterableCounter += 1;

        SyncPromise.resolve(value).then(
          (result) => {
            resolve(cast<Awaited<T>>(result));
          },
          (reason) => {
            rejectedCounter += 1;
            reasons[index] = reason;
            if (isDone && rejectedCounter === iterableCounter)
              reject(new SyncAggregateError('All promises were rejected', reasons));
          },
        );

        ({ done, value } = iterator.next());
        isDone = done;
      }
    });
  }

  constructor(executor: (resolve: Resolve<T>, reject: Reject) => void) {
    try {
      executor(this.#resolve.bind(this), this.#reject.bind(this));
    } catch (error) {
      this.#reject(error);
    }
  }

  #resolve(value: T | PromiseLike<T>): void {
    this.#setResultAndStatus(SyncPromiseStatus.Fulfilled, value);
  }

  #reject(reason?: any): void {
    this.#setResultAndStatus(SyncPromiseStatus.Rejected, reason);
  }

  #setResultAndStatus(status: SyncPromiseStatus, valueOrReason: T | PromiseLike<T>): void {
    if (this.#status !== SyncPromiseStatus.Pending) return;

    if (isPromiseLike(valueOrReason)) {
      valueOrReason.then(this.#resolve.bind(this), this.#reject.bind(this));
    } else {
      this.#result = valueOrReason;
      this.#status = status;

      this.#executeHandlers();
    }
  }

  #executeHandlers(): void {
    if (this.#status === SyncPromiseStatus.Pending) return;

    for (const cb of this.#handlers) {
      if (this.#status === SyncPromiseStatus.Fulfilled) {
        cb.onFulfilled(this.#result);
      } else {
        cb.onRejected(this.#result);
      }
    }

    this.#handlers = [];
  }

  #addHandler(handler: Handler<T, any>): void {
    this.#handlers.push(handler);

    this.#executeHandlers();
  }

  then<F, R = never>(
    onFulfilled?: OnFulfilled<T, F> | null | undefined,
    onRejected?: OnRejected<R> | null | undefined,
  ): SyncPromise<F | R> {
    return new SyncPromise((resolve, reject) => {
      this.#addHandler({
        onFulfilled(value) {
          if (onFulfilled == null) {
            resolve(cast<F | R>(value));
          } else {
            try {
              resolve(onFulfilled(value));
            } catch (error) {
              reject(error);
            }
          }
        },
        onRejected(reason) {
          if (onRejected == null) {
            reject(reason);
          } else {
            try {
              resolve(onRejected(reason));
            } catch (error) {
              reject(error);
            }
          }
        },
      });
    });
  }

  catch<R = never>(onRejected?: OnRejected<R>): SyncPromise<T | R> {
    return this.then(null, onRejected);
  }

  finally(onFinalized?: OnFinalized): SyncPromise<T> {
    return new SyncPromise((resolve, reject) => {
      let prevPromiseValue: T;
      let prevPromiseReason: any;
      let status: SyncPromiseStatus = SyncPromiseStatus.Rejected;

      this.then(
        (value) => {
          prevPromiseValue = value;
          status = SyncPromiseStatus.Fulfilled;
          return onFinalized && onFinalized();
        },
        (reason) => {
          prevPromiseReason = reason;
          return onFinalized && onFinalized();
        },
      )
        .then(() => {
          if (status === SyncPromiseStatus.Fulfilled) {
            resolve(prevPromiseValue);
          } else {
            reject(prevPromiseReason);
          }
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }
}
