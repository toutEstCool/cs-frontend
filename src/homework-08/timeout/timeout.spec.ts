import sleep from '../sleep/sleep';
import timeout from './timeout';

describe('Timeout function implementation', () => {
  const timeoutValue = 500;

  it('Timeout function must reject provided promise after timeout passed', () => {
    const failedPromise = sleep(800);

    expect(timeout(failedPromise, timeoutValue)).rejects.toThrowError('Timeout');
  });

  it('Timeout function must resolve provided promise if it resolves before the timeout', () => {
    const succeededPromise = sleep(300).then(() => 'Success');

    expect(timeout(succeededPromise, timeoutValue)).resolves.toBe('Success');
  });

  it('Timeout function must pass the rejection of provided promise', () => {
    const failedButFastPromise = sleep(300).then(() => {
      throw new Error('Service error');
    });

    expect(timeout(failedButFastPromise, timeoutValue)).rejects.toThrowError('Service error');
  });
});
