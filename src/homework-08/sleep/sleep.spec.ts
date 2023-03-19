import sleep from './sleep';

describe('Sleep function implementation', () => {
  it('Sleep function must defer code execution for provided time', (done) => {
    const startTime = performance.now();
    const delayTime = 500;

    sleep(delayTime).then(() => {
      try {
        expect(performance.now() - startTime).toBeGreaterThanOrEqual(delayTime);
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
