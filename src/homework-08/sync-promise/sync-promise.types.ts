export enum SyncPromiseStatus {
  Pending,
  Fulfilled,
  Rejected,
}

export type Resolve<T> = (value: T | PromiseLike<T>) => void;

export type Reject = (reason?: any) => void;

export type OnFulfilled<T, F> = (value: T) => F | PromiseLike<F>;

export type OnRejected<R> = (reason?: any) => R | PromiseLike<R>;

export type OnFinalized = (() => void) | null | undefined;

export interface Handler<T, F> {
  onFulfilled: OnFulfilled<T, F>;
  onRejected: OnRejected<F>;
}
