/* eslint-disable no-console */
import wildcardMatcher from '../helpers/index.js';

export default class EventHandlersProviderImpl {
  constructor({ namespaces = false, namespaceDelimiter = '.', maxListeners = 0, relatedEventsTimeout = 0 } = {}) {
    this.eventHandlersMap = new Map();
    this.relatedEventsHandlersMap = new Map();
    this.eventStreamsResolversMap = new Map();
    this.anyEventHandlers = [];
    this.namespaces = namespaces;
    this.namespaceDelimiter = namespaceDelimiter;
    this.maxListeners = maxListeners;
    this.relatedEventsTimeout = relatedEventsTimeout;
  }

  checkoutEventHandlersArray(eventName) {
    if (!this.eventHandlersMap.has(eventName)) {
      this.eventHandlersMap.set(eventName, []);
    }
    return this.eventHandlersMap.get(eventName);
  }

  checkEventListenersAmount(eventName) {
    const handlers = eventName == null ? this.anyEventHandlers : this.eventHandlersMap.get(eventName) ?? [];
    const event = eventName ?? 'any';
    if (this.maxListeners !== 0 && handlers.length > this.maxListeners) {
      console.warn(
        `Possible EventEmitter memory leak detected for event: ${event}. Use emitter.setMaxListeners() to increase limit`,
      );
    }
  }

  isEventNameMatches(eventName, firedEvent) {
    return this.namespaces ? wildcardMatcher(firedEvent, eventName, this.namespaceDelimiter) : eventName === firedEvent;
  }

  getMaxListeners() {
    return this.maxListeners;
  }

  setMaxListeners(maxListeners) {
    if (maxListeners == null || maxListeners < 0) {
      throw new RangeError('Amount of listeners must be greater or equal 0');
    }
    this.maxListeners = maxListeners;
  }

  getRelatedEventsTimeout() {
    return this.relatedEventsTimeout;
  }

  setRelatedEventsTimeout(timeout) {
    if (timeout == null || timeout < 0) {
      throw new RangeError('Timeout value must be greater or equal 0');
    }
    this.relatedEventsTimeout = timeout;
  }

  addEventHandler(eventName, handler, order = 'append') {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }
    const eventHandlers = this.checkoutEventHandlersArray(eventName);
    if (order === 'append') {
      eventHandlers.push(handler);
    } else {
      eventHandlers.unshift(handler);
    }
    this.checkEventListenersAmount(eventName);
  }

  removeEventHandler(eventName, handler) {
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

  removeAllEventHandlers(eventName) {
    return this.eventHandlersMap.delete(eventName);
  }

  addAnyEventHandler(handler, order = 'append') {
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

  removeAnyEventHandler(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }
    this.anyEventHandlers = this.anyEventHandlers.filter((cb) => cb !== handler);
  }

  addRelatedEventsHandler(events, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('Event handler must be a type of function');
    }
    const relatedEvents = {
      handler,
      eventsData: Object.create(null),
    };
    this.relatedEventsHandlersMap.set(events, relatedEvents);
  }

  removeRelatedEventsHandler(events) {
    this.relatedEventsHandlersMap.delete(events);
  }

  addEventStream(eventName) {
    this.eventStreamsResolversMap.set(eventName, {
      resolver: () => {},
      unsubscriber: () => {},
    });
    return {
      next: async () =>
        new Promise((resolve) => {
          this.eventStreamsResolversMap.set(eventName, {
            resolver(payload) {
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

  removeEventStream(eventName) {
    const eventStreamHandlers = this.eventStreamsResolversMap.get(eventName);
    if (eventStreamHandlers != null) {
      eventStreamHandlers.unsubscriber();
      this.eventStreamsResolversMap.delete(eventName);
    }
  }

  *getEventHandlers(eventName) {
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

  *getAnyEventsHandlers() {
    yield* this.anyEventHandlers;
  }

  *handleRelatedEvents(eventName, payload) {
    const matchedOfRegisteredRelatedEvents = Array.from(this.relatedEventsHandlersMap.keys()).filter((relatedEvents) =>
      relatedEvents.some((eventItem) => this.isEventNameMatches(eventItem, eventName)),
    );
    for (const relatedEventsList of matchedOfRegisteredRelatedEvents) {
      const relatedEventsData = this.relatedEventsHandlersMap.get(relatedEventsList);
      if (relatedEventsData == null) return;
      const firedEventData = {
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

  *getEventStreamResolver(eventName) {
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

  *getEventsNames() {
    yield* this.eventHandlersMap.keys();
  }

  *getRelatedEventNames() {
    yield* this.relatedEventsHandlersMap.keys();
  }

  *getEventStreamNames() {
    yield* this.eventStreamsResolversMap.keys();
  }
}
