import EventHandlersProviderImpl from '../event-handlers-provider/index.js';
import seq from '../iterator-helpers/index.js';
import type {
  EventHandlersProvider,
  EventEmitterOptions,
  EventHandler,
  RelatedEventsHandler,
  EventUnsubscriber,
  HandlerOrder,
} from '../interfaces.js';

export default class EventEmitter {
  #eventHandlersProvider: EventHandlersProvider;

  #anyFirst: boolean;

  #relatedFirst: boolean;

  constructor({
    namespaces = false,
    namespaceDelimiter = '.',
    maxListeners = 10,
    relatedEventsTimeout = 0,
    anyFirst = false,
    relatedFirst = false,
  }: EventEmitterOptions = {}) {
    if (maxListeners < 0) {
      throw new RangeError('Amount of listeners must be greater or equal 0');
    }

    if (relatedEventsTimeout < 0) {
      throw new RangeError('Timeout value must be greater or equal 0');
    }

    this.#anyFirst = anyFirst;
    this.#relatedFirst = relatedFirst;
    if (relatedFirst) {
      this.#anyFirst = false;
    }

    const eventHandlersProviderOptions = {
      namespaces,
      namespaceDelimiter,
      maxListeners,
      relatedEventsTimeout,
    };
    this.#eventHandlersProvider = new EventHandlersProviderImpl(eventHandlersProviderOptions);
  }

  #createEventUnsubscriber(event: string | string[], handler: EventHandler): EventUnsubscriber<this> {
    const off = Array.isArray(event)
      ? () => this.#eventHandlersProvider.removeRelatedEventsHandler(event)
      : () => this.#eventHandlersProvider.removeEventHandler(event, handler);
    return {
      eventEmitter: this,
      event,
      handler,
      off,
    };
  }

  #subscribeForTimes(
    eventName: string,
    timesCount: number,
    handler: EventHandler,
    order: HandlerOrder = 'append',
  ): EventUnsubscriber<this> {
    if (timesCount <= 0) {
      throw new RangeError('Handler call times counter must be greater than 0');
    }

    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    let handlerCallsCount = 0;
    let unsubscriber: EventUnsubscriber<this>;
    const wrappedHandler = (payload: any) => {
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
  }

  #getComposedEventHandlers(eventName: string, payload: any): IterableIterator<EventHandler> {
    const anyGenerator = this.#eventHandlersProvider.getAnyEventsHandlers();
    const eventGenerator = this.#eventHandlersProvider.getEventHandlers(eventName);
    const relatedGenerator = this.#eventHandlersProvider.handleRelatedEvents(eventName, payload);

    let emitEventSequence = seq(eventGenerator, anyGenerator, relatedGenerator);
    if (this.#anyFirst) {
      emitEventSequence = seq(anyGenerator, eventGenerator, relatedGenerator);
    }
    if (this.#relatedFirst) {
      emitEventSequence = seq(relatedGenerator, eventGenerator, anyGenerator);
    }

    return emitEventSequence;
  }

  getMaxListeners(): number {
    return this.#eventHandlersProvider.getMaxListeners();
  }

  setMaxListeners(maxListeners: number): void {
    this.#eventHandlersProvider.setMaxListeners(maxListeners);
  }

  getRelatedEventsTimeout(): number {
    return this.#eventHandlersProvider.getRelatedEventsTimeout();
  }

  setRelatedEventsTimeout(timeout: number): void {
    this.#eventHandlersProvider.setRelatedEventsTimeout(timeout);
  }

  on(eventName: string, handler: EventHandler): EventUnsubscriber<this> {
    this.#eventHandlersProvider.addEventHandler(eventName, handler);
    return this.#createEventUnsubscriber(eventName, handler);
  }

  addListener(eventName: string, handler: EventHandler): EventUnsubscriber<this> {
    return this.on(eventName, handler);
  }

  prependListener(eventName: string, handler: EventHandler): EventUnsubscriber<this> {
    this.#eventHandlersProvider.addEventHandler(eventName, handler, 'prepend');
    return this.#createEventUnsubscriber(eventName, handler);
  }

  off(eventName: string, handler: EventHandler): void {
    this.#eventHandlersProvider.removeEventHandler(eventName, handler);
  }

  removeListener(eventName: string, handler: EventHandler): void {
    this.off(eventName, handler);
  }

  removeEvent(eventName: string): boolean {
    return this.#eventHandlersProvider.removeAllEventHandlers(eventName);
  }

  any(handler: EventHandler): void {
    this.#eventHandlersProvider.addAnyEventHandler(handler);
  }

  prependAny(handler: EventHandler): void {
    this.#eventHandlersProvider.addAnyEventHandler(handler, 'prepend');
  }

  removeAny(handler: EventHandler): void {
    this.#eventHandlersProvider.removeAnyEventHandler(handler);
  }

  times(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this> {
    return this.#subscribeForTimes(eventName, timesCount, handler);
  }

  prependTimes(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this> {
    return this.#subscribeForTimes(eventName, timesCount, handler, 'prepend');
  }

  once(eventName: string, handler: EventHandler): EventUnsubscriber<this> {
    return this.#subscribeForTimes(eventName, 1, handler);
  }

  prependOnce(eventName: string, handler: EventHandler): EventUnsubscriber<this> {
    return this.#subscribeForTimes(eventName, 1, handler, 'prepend');
  }

  allOf(events: string[], handler: RelatedEventsHandler): EventUnsubscriber<this> {
    this.#eventHandlersProvider.addRelatedEventsHandler(events, handler);
    return this.#createEventUnsubscriber(events, handler);
  }

  removeAllOf(events: string[]): void {
    this.#eventHandlersProvider.removeRelatedEventsHandler(events);
  }

  stream(eventName: string): AsyncIterableIterator<any> {
    return this.#eventHandlersProvider.addEventStream(eventName);
  }

  removeStream(eventName: string): void {
    this.#eventHandlersProvider.removeEventStream(eventName);
  }

  handlers(eventName: string): EventHandler[] {
    const eventHandlersGenerator = this.#eventHandlersProvider.getEventHandlers(eventName);
    return Array.from(eventHandlersGenerator);
  }

  handlersAny(): EventHandler[] {
    const anyEventsHandlersGenerator = this.#eventHandlersProvider.getAnyEventsHandlers();
    return Array.from(anyEventsHandlersGenerator);
  }

  eventNames(): string[] {
    const eventNamesGenerator = this.#eventHandlersProvider.getEventsNames();
    return Array.from(eventNamesGenerator);
  }

  relatedEventNames(): string[][] {
    const relatedEventNamesGenerator = this.#eventHandlersProvider.getRelatedEventNames();
    return Array.from(relatedEventNamesGenerator);
  }

  eventStreamNames(): string[] {
    const eventStreamNamesGenerator = this.#eventHandlersProvider.getEventStreamNames();
    return Array.from(eventStreamNamesGenerator);
  }

  emit(eventName: string, payload: any): void {
    const emitEventSequence = this.#getComposedEventHandlers(eventName, payload);
    for (const cb of emitEventSequence) {
      cb(payload);
    }

    const streamResolvers = this.#eventHandlersProvider.getEventStreamResolver(eventName);
    setTimeout(() => {
      for (const cb of streamResolvers) {
        cb(payload);
      }
    });
  }

  await(eventName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.on(eventName, (payload: any) => {
        if (payload instanceof Error) {
          reject(payload);
        } else {
          resolve(payload);
        }
      });
    });
  }
}
