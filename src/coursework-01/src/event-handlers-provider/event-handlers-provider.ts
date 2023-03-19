/* eslint-disable no-console */
import wildcardMatcher from '../helpers/index.js';
import type {
  EventHandlersProvider,
  EventHandler,
  RelatedEventsHandler,
  EventHandlersProviderOptions,
  HandlerOrder,
  RelatedEvents,
  RelatedEventData,
  EventStreamHandlers,
} from '../interfaces.js';

export default class EventHandlersProviderImpl implements EventHandlersProvider {
  eventHandlersMap = new Map<string, EventHandler[]>();

  relatedEventsHandlersMap = new Map<string[], RelatedEvents>();

  eventStreamsResolversMap = new Map<string, EventStreamHandlers>();

  anyEventHandlers: EventHandler[] = [];

  namespaces: boolean;

  namespaceDelimiter: string;

  maxListeners: number;

  relatedEventsTimeout: number;

  constructor({
    namespaces = false,
    namespaceDelimiter = '.',
    maxListeners = 0,
    relatedEventsTimeout = 0,
  }: EventHandlersProviderOptions = {}) {
    this.namespaces = namespaces;
    this.namespaceDelimiter = namespaceDelimiter;
    this.maxListeners = maxListeners;
    this.relatedEventsTimeout = relatedEventsTimeout;
  }

  checkoutEventHandlersArray(eventName: string): EventHandler[] {
    if (!this.eventHandlersMap.has(eventName)) {
      this.eventHandlersMap.set(eventName, []);
    }

    return this.eventHandlersMap.get(eventName)!;
  }

  checkEventListenersAmount(eventName?: string): void {
    const handlers = eventName == null ? this.anyEventHandlers : this.eventHandlersMap.get(eventName) ?? [];
    const event = eventName ?? 'any';
    if (this.maxListeners !== 0 && handlers.length > this.maxListeners) {
      console.warn(
        `Possible EventEmitter memory leak detected for event: ${event}. Use emitter.setMaxListeners() to increase limit`,
      );
    }
  }

  isEventNameMatches(eventName: string, firedEvent: string): boolean {
    return this.namespaces ? wildcardMatcher(firedEvent, eventName, this.namespaceDelimiter) : eventName === firedEvent;
  }

  getMaxListeners(): number {
    return this.maxListeners;
  }

  setMaxListeners(maxListeners: number) {
    if (maxListeners == null || maxListeners < 0) {
      throw new RangeError('Amount of listeners must be greater or equal 0');
    }

    this.maxListeners = maxListeners;
  }

  getRelatedEventsTimeout(): number {
    return this.relatedEventsTimeout;
  }

  setRelatedEventsTimeout(timeout: number): void {
    if (timeout == null || timeout < 0) {
      throw new RangeError('Timeout value must be greater or equal 0');
    }

    this.relatedEventsTimeout = timeout;
  }

  addEventHandler(eventName: string, handler: EventHandler, order: HandlerOrder = 'append'): void {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    const eventHandlers = this.checkoutEventHandlersArray(eventName);
    if (order === 'append') {
      eventHandlers!.push(handler);
    } else {
      eventHandlers!.unshift(handler);
    }

    this.checkEventListenersAmount(eventName);
  }

  removeEventHandler(eventName: string, handler: EventHandler): void {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    const eventHandlers = this.eventHandlersMap.get(eventName);
    if (!eventHandlers) return;

    const cleanedUpEventHandlers = eventHandlers.filter((cb) => cb !== handler);
    if (cleanedUpEventHandlers.length > 0) {
      this.eventHandlersMap.set(eventName, cleanedUpEventHandlers);
    } else {
      this.eventHandlersMap.delete(eventName);
    }
  }

  removeAllEventHandlers(eventName: string): boolean {
    return this.eventHandlersMap.delete(eventName);
  }

  addAnyEventHandler(handler: EventHandler, order: HandlerOrder = 'append'): void {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    if (order === 'append') {
      this.anyEventHandlers.push(handler);
    } else {
      this.anyEventHandlers.unshift(handler);
    }

    this.checkEventListenersAmount();
  }

  removeAnyEventHandler(handler: EventHandler): void {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    this.anyEventHandlers = this.anyEventHandlers.filter((cb) => cb !== handler);
  }

  addRelatedEventsHandler(events: string[], handler: RelatedEventsHandler): void {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }

    const relatedEvents: RelatedEvents = {
      handler,
      eventsData: Object.create(null),
    };
    this.relatedEventsHandlersMap.set(events, relatedEvents);
  }

  removeRelatedEventsHandler(events: string[]): void {
    this.relatedEventsHandlersMap.delete(events);
  }

  addEventStream(eventName: string): AsyncIterableIterator<any> {
    this.eventStreamsResolversMap.set(eventName, {
      resolver: () => {},
      unsubscriber: () => {},
    });

    return {
      next: async () =>
        new Promise((resolve) => {
          this.eventStreamsResolversMap.set(eventName, {
            resolver(payload: any) {
              resolve({ done: false, value: payload });
            },
            unsubscriber() {
              resolve({ done: true, value: undefined });
            },
          });
        }),
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  }

  removeEventStream(eventName: string): void {
    const eventStreamHandlers = this.eventStreamsResolversMap.get(eventName);
    if (eventStreamHandlers != null) {
      eventStreamHandlers.unsubscriber();
      this.eventStreamsResolversMap.delete(eventName);
    }
  }

  *getEventHandlers(eventName: string): Generator<EventHandler, void, undefined> {
    if (this.namespaces) {
      const eventHandlersMapIterator = this.eventHandlersMap.entries();
      for (const [event, handlers] of eventHandlersMapIterator) {
        if (wildcardMatcher(eventName, event, this.namespaceDelimiter)) {
          yield* handlers;
        }
      }
    } else {
      const eventHandlers = this.eventHandlersMap.get(eventName) ?? [];
      yield* eventHandlers;
    }
  }

  *getAnyEventsHandlers(): Generator<EventHandler, void, undefined> {
    yield* this.anyEventHandlers;
  }

  *handleRelatedEvents(eventName: string, payload: any): Generator<EventHandler> {
    const matchedOfRegisteredRelatedEvents = Array.from(this.relatedEventsHandlersMap.keys()).filter((relatedEvents) =>
      relatedEvents.some((eventItem) => this.isEventNameMatches(eventItem, eventName)),
    );

    for (const relatedEventsList of matchedOfRegisteredRelatedEvents) {
      const relatedEventsData = this.relatedEventsHandlersMap.get(relatedEventsList);

      if (relatedEventsData == null) return;

      const firedEventData: RelatedEventData = {
        payload,
        firedTimestamp: Date.now(),
      };
      relatedEventsData.eventsData[eventName] = firedEventData;

      const eventData = Object.values(relatedEventsData.eventsData);
      const areAllRelatedEventsFired = eventData.length === relatedEventsList.length;
      const areEventPayloadsRecent =
        this.relatedEventsTimeout <= 0 ||
        eventData.every(({ firedTimestamp }) => Date.now() - firedTimestamp < this.relatedEventsTimeout);

      if (areEventPayloadsRecent && areAllRelatedEventsFired) {
        const payloadsList = eventData.map((data) => data.payload);

        yield () => relatedEventsData.handler(...payloadsList);

        relatedEventsData.eventsData = Object.create(null);
      }
    }
  }

  *getEventStreamResolver(eventName: string): Generator<EventHandler, void, undefined> {
    if (this.namespaces) {
      const eventsStremResolversMapIterator = this.eventStreamsResolversMap.entries();
      for (const [event, eventStreamHandlers] of eventsStremResolversMapIterator) {
        if (wildcardMatcher(eventName, event, this.namespaceDelimiter)) {
          yield eventStreamHandlers.resolver;
        }
      }
    } else {
      const eventStreamHandlers = this.eventStreamsResolversMap.get(eventName);
      if (eventStreamHandlers != null) yield eventStreamHandlers.resolver;
    }
  }

  *getEventsNames(): Generator<string, void, undefined> {
    yield* this.eventHandlersMap.keys();
  }

  *getRelatedEventNames(): Generator<string[], void, undefined> {
    yield* this.relatedEventsHandlersMap.keys();
  }

  *getEventStreamNames(): Generator<string, void, undefined> {
    yield* this.eventStreamsResolversMap.keys();
  }
}
