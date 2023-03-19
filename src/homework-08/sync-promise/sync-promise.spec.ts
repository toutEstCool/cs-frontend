/* eslint-disable prefer-promise-reject-errors */
import SyncPromise from './sync-promise';

describe('SyncPromise implementation', () => {
  it('SyncPromise must provide Promise compatible API', (done) => {
    new SyncPromise<number>((resolve) => {
      resolve(1);
    })
      // @ts-expect-error
      .then((value) => value.trim())
      .then((value) => value)
      .catch(() => 42)
      .finally(() => 'finally')
      .then((value) => {
        try {
          expect(value).toBe(42);
          done();
        } catch (testError) {
          done(testError);
        }
      });
  });

  it('SyncPromise must be able resolve synchronously when possible', (done) => {
    const syncResults: number[] = [];

    syncResults.push(1);

    SyncPromise.resolve(2).then((value) => {
      syncResults.push(value);
    });

    syncResults.push(3);

    try {
      expect(syncResults).toEqual([1, 2, 3]);
      done();
    } catch (testError) {
      done(testError);
    }
  });

  it('SyncPromise must resolve asynchronously for async tasks', (done) => {
    const syncResults: number[] = [];

    syncResults.push(1);

    SyncPromise.resolve(2)
      .then((value) => Promise.resolve(value))
      .then((value) => {
        syncResults.push(value);
      })
      .then(() => {
        try {
          expect(syncResults).toEqual([1, 3, 2]);
          done();
        } catch (testError) {
          done(testError);
        }
      });

    syncResults.push(3);
  });

  it('SyncPromise must provide static method resolve', (done) => {
    SyncPromise.resolve(1).then((value) => {
      try {
        expect(value).toBe(1);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method reject', (done) => {
    SyncPromise.reject(new Error('Rejected')).catch((error: Error) => {
      try {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Rejected');
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method all (case with all resolved promises)', (done) => {
    const syncOne = SyncPromise.resolve(1);

    const asyncTwo = Promise.resolve(2);

    const syncThree = new SyncPromise<number>((resolve) => {
      setTimeout(resolve, 0, 3);
    });

    SyncPromise.all([syncOne, asyncTwo, syncThree]).then((results) => {
      try {
        expect(results).toEqual([1, 2, 3]);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method all (case with rejected promise)', (done) => {
    const syncOne = SyncPromise.resolve(1);

    const asyncTwo = Promise.resolve(2);

    const syncThree = new SyncPromise<number>((resolve) => {
      setTimeout(resolve, 0, 3);
    });

    const rejected = Promise.reject(new Error('Rejected'));

    SyncPromise.all([syncOne, asyncTwo, rejected, syncThree]).catch((error: Error) => {
      try {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Rejected');
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method race (case with all resolved promises)', (done) => {
    const syncOne = new SyncPromise<number>((resolve) => {
      setTimeout(resolve, 1500, 1);
    });

    const asyncTwo = new Promise<number>((resolve) => {
      setTimeout(resolve, 500, 2);
    });

    const asyncThree = new Promise<number>((resolve) => {
      setTimeout(resolve, 2500, 3);
    });

    SyncPromise.race([syncOne, asyncTwo, asyncThree]).then((value) => {
      try {
        expect(value).toBe(2);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method race (case with rejected promise)', (done) => {
    const syncOne = new SyncPromise<number>((resolve) => {
      setTimeout(resolve, 1500, 1);
    });

    const asyncTwo = new Promise<number>((resolve) => {
      setTimeout(resolve, 500, 2);
    });

    const asyncThree = new Promise<number>((resolve) => {
      setTimeout(resolve, 2500, 3);
    });

    const rejected = new SyncPromise<number>((_, reject) => {
      setTimeout(reject, 100, new Error('Rejected'));
    });

    SyncPromise.race([syncOne, asyncTwo, rejected, asyncThree]).catch((error: Error) => {
      try {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Rejected');
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method allSettled', (done) => {
    const syncOne = SyncPromise.resolve(1);

    const asyncTwo = Promise.resolve(2);

    const rejected = SyncPromise.reject('Fail');

    SyncPromise.allSettled([syncOne, asyncTwo, rejected]).then((results) => {
      try {
        expect(results).toEqual([
          {
            status: 'fulfilled',
            value: 1,
          },
          {
            status: 'fulfilled',
            value: 2,
          },
          {
            status: 'rejected',
            reason: 'Fail',
          },
        ]);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method any (case with resolved promise)', (done) => {
    const rejectedOne = SyncPromise.reject(1);

    const rejectedTwo = Promise.reject(2);

    const rejectedThree = new SyncPromise<number>((resolve) => {
      setTimeout(resolve, 0, 3);
    });

    const resolved = SyncPromise.resolve(4);

    SyncPromise.any([rejectedOne, resolved, rejectedTwo, rejectedThree]).then((value) => {
      try {
        expect(value).toBe(4);
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });

  it('SyncPromise must provide static method any (case with all rejected promises)', (done) => {
    const rejectedOne = SyncPromise.reject(1);

    const rejectedTwo = Promise.reject(2);

    const rejectedThree = new SyncPromise<number>((_, reject) => {
      setTimeout(reject, 0, 3);
    });

    SyncPromise.any([rejectedOne, rejectedTwo, rejectedThree]).catch((error: Error) => {
      try {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('All promises were rejected');
        done();
      } catch (testError) {
        done(testError);
      }
    });
  });
});
