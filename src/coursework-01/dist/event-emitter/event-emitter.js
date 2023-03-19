import EventHandlersProviderImpl from '../event-handlers-provider/index.js';
import seq from '../iterator-helpers/index.js';

const __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === 'm') throw new TypeError('Private method is not writable');
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a setter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot write private member to an object whose class did not declare it');
    return kind === 'a' ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
  };
const __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a getter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot read private member from an object whose class did not declare it');
    return kind === 'm' ? f : kind === 'a' ? f.call(receiver) : f ? f.value : state.get(receiver);
  };
let _EventEmitter_instances;
let _EventEmitter_eventHandlersProvider;
let _EventEmitter_anyFirst;
let _EventEmitter_relatedFirst;
let _EventEmitter_createEventUnsubscriber;
let _EventEmitter_subscribeForTimes;
let _EventEmitter_getComposedEventHandlers;

export default class EventEmitter {
  constructor({
    namespaces = false,
    namespaceDelimiter = '.',
    maxListeners = 10,
    relatedEventsTimeout = 0,
    anyFirst = false,
    relatedFirst = false,
  } = {}) {
    _EventEmitter_instances.add(this);
    _EventEmitter_eventHandlersProvider.set(this, void 0);
    _EventEmitter_anyFirst.set(this, void 0);
    _EventEmitter_relatedFirst.set(this, void 0);
    if (maxListeners < 0) {
      throw new RangeError('Amount of listeners must be greater or equal 0');
    }
    if (relatedEventsTimeout < 0) {
      throw new RangeError('Timeout value must be greater or equal 0');
    }
    __classPrivateFieldSet(this, _EventEmitter_anyFirst, anyFirst, 'f');
    __classPrivateFieldSet(this, _EventEmitter_relatedFirst, relatedFirst, 'f');
    if (relatedFirst) {
      __classPrivateFieldSet(this, _EventEmitter_anyFirst, false, 'f');
    }
    const eventHandlersProviderOptions = {
      namespaces,
      namespaceDelimiter,
      maxListeners,
      relatedEventsTimeout,
    };
    __classPrivateFieldSet(
      this,
      _EventEmitter_eventHandlersProvider,
      new EventHandlersProviderImpl(eventHandlersProviderOptions),
      'f',
    );
  }

  getMaxListeners() {
    return __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').getMaxListeners();
  }

  setMaxListeners(maxListeners) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').setMaxListeners(maxListeners);
  }

  getRelatedEventsTimeout() {
    return __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').getRelatedEventsTimeout();
  }

  setRelatedEventsTimeout(timeout) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').setRelatedEventsTimeout(timeout);
  }

  on(eventName, handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addEventHandler(eventName, handler);
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_createEventUnsubscriber).call(
      this,
      eventName,
      handler,
    );
  }

  addListener(eventName, handler) {
    return this.on(eventName, handler);
  }

  prependListener(eventName, handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addEventHandler(
      eventName,
      handler,
      'prepend',
    );
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_createEventUnsubscriber).call(
      this,
      eventName,
      handler,
    );
  }

  off(eventName, handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeEventHandler(eventName, handler);
  }

  removeListener(eventName, handler) {
    this.off(eventName, handler);
  }

  removeEvent(eventName) {
    return __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeAllEventHandlers(eventName);
  }

  any(handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addAnyEventHandler(handler);
  }

  prependAny(handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addAnyEventHandler(handler, 'prepend');
  }

  removeAny(handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeAnyEventHandler(handler);
  }

  times(eventName, timesCount, handler) {
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_subscribeForTimes).call(
      this,
      eventName,
      timesCount,
      handler,
    );
  }

  prependTimes(eventName, timesCount, handler) {
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_subscribeForTimes).call(
      this,
      eventName,
      timesCount,
      handler,
      'prepend',
    );
  }

  once(eventName, handler) {
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_subscribeForTimes).call(
      this,
      eventName,
      1,
      handler,
    );
  }

  prependOnce(eventName, handler) {
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_subscribeForTimes).call(
      this,
      eventName,
      1,
      handler,
      'prepend',
    );
  }

  allOf(events, handler) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addRelatedEventsHandler(events, handler);
    return __classPrivateFieldGet(this, _EventEmitter_instances, 'm', _EventEmitter_createEventUnsubscriber).call(
      this,
      events,
      handler,
    );
  }

  removeAllOf(events) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeRelatedEventsHandler(events);
  }

  stream(eventName) {
    return __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').addEventStream(eventName);
  }

  removeStream(eventName) {
    __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeEventStream(eventName);
  }

  handlers(eventName) {
    const eventHandlersGenerator = __classPrivateFieldGet(
      this,
      _EventEmitter_eventHandlersProvider,
      'f',
    ).getEventHandlers(eventName);
    return Array.from(eventHandlersGenerator);
  }

  handlersAny() {
    const anyEventsHandlersGenerator = __classPrivateFieldGet(
      this,
      _EventEmitter_eventHandlersProvider,
      'f',
    ).getAnyEventsHandlers();
    return Array.from(anyEventsHandlersGenerator);
  }

  eventNames() {
    const eventNamesGenerator = __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').getEventsNames();
    return Array.from(eventNamesGenerator);
  }

  relatedEventNames() {
    const relatedEventNamesGenerator = __classPrivateFieldGet(
      this,
      _EventEmitter_eventHandlersProvider,
      'f',
    ).getRelatedEventNames();
    return Array.from(relatedEventNamesGenerator);
  }

  eventStreamNames() {
    const eventStreamNamesGenerator = __classPrivateFieldGet(
      this,
      _EventEmitter_eventHandlersProvider,
      'f',
    ).getEventStreamNames();
    return Array.from(eventStreamNamesGenerator);
  }

  emit(eventName, payload) {
    const emitEventSequence = __classPrivateFieldGet(
      this,
      _EventEmitter_instances,
      'm',
      _EventEmitter_getComposedEventHandlers,
    ).call(this, eventName, payload);
    for (const cb of emitEventSequence) {
      cb(payload);
    }
    const streamResolvers = __classPrivateFieldGet(
      this,
      _EventEmitter_eventHandlersProvider,
      'f',
    ).getEventStreamResolver(eventName);
    setTimeout(() => {
      for (const cb of streamResolvers) {
        cb(payload);
      }
    });
  }

  await(eventName) {
    return new Promise((resolve, reject) => {
      this.on(eventName, (payload) => {
        if (payload instanceof Error) {
          reject(payload);
        } else {
          resolve(payload);
        }
      });
    });
  }
}
(_EventEmitter_eventHandlersProvider = new WeakMap()),
  (_EventEmitter_anyFirst = new WeakMap()),
  (_EventEmitter_relatedFirst = new WeakMap()),
  (_EventEmitter_instances = new WeakSet()),
  (_EventEmitter_createEventUnsubscriber = function _EventEmitter_createEventUnsubscriber(event, handler) {
    const off = Array.isArray(event)
      ? () => __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeRelatedEventsHandler(event)
      : () => __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').removeEventHandler(event, handler);
    return {
      eventEmitter: this,
      event,
      handler,
      off,
    };
  }),
  (_EventEmitter_subscribeForTimes = function _EventEmitter_subscribeForTimes(
    eventName,
    timesCount,
    handler,
    order = 'append',
  ) {
    if (timesCount <= 0) {
      throw new RangeError('Handler call times counter must be greater than 0');
    }
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }
    let handlerCallsCount = 0;
    let unsubscriber;
    const wrappedHandler = (payload) => {
      handler(payload);
      handlerCallsCount += 1;
      if (handlerCallsCount >= timesCount) {
        unsubscriber.off();
      }
    };
    unsubscriber =
      order === 'append'
        ? this.addListener(eventName, wrappedHandler)
        : this.prependListener(eventName, wrappedHandler);
    return unsubscriber;
  }),
  (_EventEmitter_getComposedEventHandlers = function _EventEmitter_getComposedEventHandlers(eventName, payload) {
    const anyGenerator = __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').getAnyEventsHandlers();
    const eventGenerator = __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').getEventHandlers(
      eventName,
    );
    const relatedGenerator = __classPrivateFieldGet(this, _EventEmitter_eventHandlersProvider, 'f').handleRelatedEvents(
      eventName,
      payload,
    );
    let emitEventSequence = seq(eventGenerator, anyGenerator, relatedGenerator);
    if (__classPrivateFieldGet(this, _EventEmitter_anyFirst, 'f')) {
      emitEventSequence = seq(anyGenerator, eventGenerator, relatedGenerator);
    }
    if (__classPrivateFieldGet(this, _EventEmitter_relatedFirst, 'f')) {
      emitEventSequence = seq(relatedGenerator, eventGenerator, anyGenerator);
    }
    return emitEventSequence;
  });
