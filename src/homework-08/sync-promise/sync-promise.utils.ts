export default (value: any): value is PromiseLike<any> =>
  value != null && typeof value === 'object' && typeof value.then === 'function';
