export default class SyncAggregateError<T> extends Error {
  readonly errors: T[] = [];

  constructor(message: string, errors: T[]) {
    super(message);
    this.errors = errors;
  }
}
