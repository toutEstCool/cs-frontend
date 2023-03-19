import EventEmitter from '../src/event-emitter/event-emitter';
import take from '../src/async-iterator-helpers/async-itertator-functions/take';
import map from '../src/async-iterator-helpers/async-itertator-functions/map';
import filter from '../src/async-iterator-helpers/async-itertator-functions/filter';

describe('Implementation of Event Emitter (EE)', () => {
  it('Subscription on event, emitting event with payload data, event unsubscription', () => {
    const ee = new EventEmitter();
    const results: number[] = [];

    const event = ee.on('foo', (value: number) => {
      results.push(value);
    });

    for (const num of [1, 2, 3, 4, 5, 6, 7, 8]) {
      ee.emit('foo', num);

      if (num === 5) event.off();
    }

    ee.emit('foo', 42);

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it('Multiple subscriptions on event, prepending event handler', () => {
    const ee = new EventEmitter();
    const results: number[] = [];

    ee.on('foo', () => {
      results.push(1);
    });

    ee.addListener('foo', () => {
      results.push(2);
    });

    ee.prependListener('foo', () => {
      results.push(3);
    });

    ee.emit('foo', null);

    expect(ee.removeEvent('foo')).toBe(true);
    expect(results).toEqual([3, 1, 2]);
  });

  it('Event unsubscription with method off', () => {
    const ee = new EventEmitter();
    const results: number[] = [];
    const eventName = 'foo';
    const cb = (value: number) => {
      results.push(value);
    };

    ee.on(eventName, cb);

    for (const num of [1, 2, 3, 4, 5, 6, 7, 8]) {
      ee.emit('foo', num);

      if (num === 3) ee.off(eventName, cb);
    }

    ee.emit('foo', 42);

    expect(results).toEqual([1, 2, 3]);
  });

  it('Handling any event with unsubscription', () => {
    const ee = new EventEmitter();
    const results: number[] = [];
    const cb = (value: number) => {
      results.push(value);
    };

    ee.any(cb);

    for (const num of [1, 2, 3, 4, 5]) {
      ee.emit('foo', num);
      ee.emit('bar', num * 2);

      if (num === 3) ee.removeAny(cb);
    }

    ee.emit('foo', 42);
    ee.emit('bar', 42);

    expect(results).toEqual([1, 2, 2, 4, 3, 6]);
  });

  it('Subscription on event with TTL', () => {
    const ee = new EventEmitter();
    const onceResults: number[] = [];
    const timesResults: number[] = [];

    const onceEvent = ee.once('foo', (value: number) => {
      onceResults.push(value);
    });

    const timesEvent = ee.times('foo', 3, (value: number) => {
      timesResults.push(value);
    });

    for (const num of [1, 2, 3, 4, 5, 6, 7]) {
      ee.emit('foo', num);
    }

    onceEvent.off();
    timesEvent.off();
    ee.emit('foo', 42);

    expect(onceResults).toEqual([1]);
    expect(timesResults).toEqual([1, 2, 3]);
  });

  it('Subscription on related events (must be fired all off provided events to call a cb), unsubscription', () => {
    const ee = new EventEmitter();
    const results: number[] = [];

    const event = ee.allOf(['foo', 'bar'], (a: number, b: number) => {
      results.push(a, b);
    });

    ee.emit('foo', 1);
    expect(results).toEqual([]);

    ee.emit('bar', 2);
    expect(results).toEqual([1, 2]);

    event.off();
    ee.emit('foo', 1);
    ee.emit('bar', 2);
    expect(results).toEqual([1, 2]);
  });

  it('Related events timeout - customizable payload lifetime', (done) => {
    const ee = new EventEmitter({ relatedEventsTimeout: 200 });
    const results: number[] = [];
    let counter = 0;

    const event = ee.allOf(['foo', 'bar'], (a: number, b: number) => {
      results.push(a, b);
    });

    const id = setInterval(() => {
      counter += 1;

      if (counter === 1) ee.emit('foo', 1);
      if (counter === 3) ee.emit('bar', 2);
      if (counter === 5) {
        event.off();
        clearInterval(id);

        try {
          expect(results).toEqual([]);
          done();
        } catch (testError) {
          done(testError);
        }
      }
    }, 100);
  });

  it('Subscription on event with Promise API', (done) => {
    const ee = new EventEmitter();

    ee.await('foo').then((value: number) => {
      try {
        expect(value).toBe(42);
        done();
      } catch (testError) {
        done(testError);
      }
    });

    ee.emit('foo', 42);
  });

  it('Getting registered event names, handlers etc.', () => {
    const ee = new EventEmitter();

    ee.on('foo', () => {});
    ee.once('foo', () => {});
    ee.times('bar', 2, () => {});

    ee.any(() => {});

    ee.allOf(['bla', 'bar'], () => {});
    ee.allOf(['foo', 'buzz'], () => {});

    ee.stream('bar');
    ee.stream('fizz');

    expect(ee.handlers('foo').every((cb) => typeof cb === 'function')).toBe(true);
    expect(ee.handlers('foo').length).toBe(2);

    expect(ee.handlers('bar').every((cb) => typeof cb === 'function')).toBe(true);
    expect(ee.handlers('bar').length).toBe(1);

    expect(ee.handlersAny().every((cb) => typeof cb === 'function')).toBe(true);
    expect(ee.handlersAny().length).toBe(1);

    expect(ee.eventNames()).toEqual(['foo', 'bar']);

    expect(ee.relatedEventNames()).toEqual([
      ['bla', 'bar'],
      ['foo', 'buzz'],
    ]);

    expect(ee.eventStreamNames()).toEqual(['bar', 'fizz']);
  });

  it('Event subscription stream with async iterator API', async () => {
    const ee = new EventEmitter();
    const results: number[] = [];
    let counter = 0;

    const id = setInterval(() => {
      counter += 1;

      ee.emit('foo', counter);

      if (counter > 5) ee.removeStream('foo');
      if (counter === 10) clearInterval(id);
    });

    for await (const value of ee.stream('foo')) {
      results.push(value as number);
    }

    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it('Event stream working with async iterator helpers composition', async () => {
    const ee = new EventEmitter();
    const results: string[] = [];
    let counter = 0;

    const id = setInterval(() => {
      counter += 1;

      ee.emit('foo', counter);

      if (counter === 20) {
        ee.removeStream('foo');
        clearInterval(id);
      }
    });

    const iterComposition = take(
      map(
        filter(ee.stream('foo'), (value: number) => value % 2 === 0),
        (value: number) => value.toString(),
      ),
      5,
    );

    for await (const value of iterComposition) {
      results.push(value as string);
    }

    expect(results).toEqual(['2', '4', '6', '8', '10']);
  });

  it('Working with event namespaces (strings with delimiters and wildcards)', () => {
    const ee = new EventEmitter({ namespaces: true });
    const results: number[] = [];

    ee.on('foo.*', (value: number) => {
      results.push(value);
    });

    for (const num of [1, 2, 3]) {
      ee.emit('foo.bar', num);
      ee.emit('foo.bla', num * 2);
      ee.emit('bar.bla', num + 2);
    }

    expect(results).toEqual([1, 2, 2, 4, 3, 6]);
  });

  it('Working with event namespaces (multilevel, many events, custom delimiter)', () => {
    const ee = new EventEmitter({ namespaces: true, namespaceDelimiter: ':' });
    const results: number[] = [];

    ee.on('foo:**', () => {
      results.push(1);
    });

    ee.on('*:bla:**:bar', () => {
      results.push(2);
    });

    ee.on('foo:**:bar', () => {
      results.push(3);
    });

    ee.emit('foo', null);
    ee.emit('foo:bla', null);
    ee.emit('foo:bla:bar', null);
    ee.emit('foo:bla:fizz:bar', null);

    expect(results).toEqual([1, 1, 1, 2, 3, 1, 2, 3]);
  });

  it('Customizable event emit order for different types of event (anyFirst: any => common => related)', () => {
    const ee = new EventEmitter({ anyFirst: true });
    const results: number[] = [];

    ee.on('foo', () => {
      results.push(1);
    });

    ee.on('foo', () => {
      results.push(2);
    });

    ee.on('bar', () => {
      results.push(3);
    });

    ee.any(() => {
      results.push(4);
    });

    ee.allOf(['foo', 'bar'], () => {
      results.push(5);
    });

    ee.emit('foo', null);
    ee.emit('bar', null);

    expect(results).toEqual([4, 1, 2, 4, 3, 5]);
  });

  it('Customizable event emit order for different types of event (relatedFirst: related => common => any)', () => {
    const ee = new EventEmitter({ relatedFirst: true });
    const results: number[] = [];

    ee.on('foo', () => {
      results.push(1);
    });

    ee.on('foo', () => {
      results.push(2);
    });

    ee.on('bar', () => {
      results.push(3);
    });

    ee.any(() => {
      results.push(4);
    });

    ee.allOf(['foo', 'bar'], () => {
      results.push(5);
    });

    ee.emit('foo', null);
    ee.emit('bar', null);

    expect(results).toEqual([1, 2, 4, 5, 3, 4]);
  });

  it('Event emitter typechecks', () => {
    expect(() => new EventEmitter({ relatedEventsTimeout: -1000 })).toThrowError(
      'Timeout value must be greater or equal 0',
    );

    expect(() => new EventEmitter({ maxListeners: -1 })).toThrowError('Amount of listeners must be greater or equal 0');

    const ee = new EventEmitter();

    // @ts-expect-error
    expect(() => ee.on('foo')).toThrowError('Event handler must be a type of function');

    // @ts-expect-error
    expect(() => ee.once('foo')).toThrowError('Event handler must be a type of function');

    expect(() => ee.times('foo', 0, () => {})).toThrowError('Handler call times counter must be greater than 0');

    // @ts-expect-error
    expect(() => ee.times('foo', 2)).toThrowError('Event handler must be a type of function');

    // @ts-expect-error
    expect(() => ee.off('foo')).toThrowError('Event handler must be a type of function');

    // @ts-expect-error
    expect(() => ee.any()).toThrowError('Event handler must be a type of function');

    // @ts-expect-error
    expect(() => ee.allOf(['foo', 'bar'])).toThrowError('Event handler must be a type of function');

    // @ts-expect-error
    expect(() => ee.setMaxListeners()).toThrowError('Amount of listeners must be greater or equal 0');

    // @ts-expect-error
    expect(() => ee.setRelatedEventsTimeout()).toThrowError('Timeout value must be greater or equal 0');
  });
});
