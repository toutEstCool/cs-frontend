export interface EventEmitterOptions {
  namespaces?: boolean;
  namespaceDelimiter?: string;
  maxListeners?: number;
  relatedEventsTimeout?: number;
  anyFirst?: boolean;
  relatedFirst?: boolean;
}

export interface EventHandlersProviderOptions {
  namespaces?: boolean;
  namespaceDelimiter?: string;
  maxListeners?: number;
  relatedEventsTimeout?: number;
}

export type EventHandler = (payload: any) => void;

export type RelatedEventsHandler = (...payloads: any[]) => void;

export type HandlerOrder = 'append' | 'prepend';

export interface EventHandlersProvider {
  addEventHandler(eventName: string, handler: EventHandler, order?: HandlerOrder): void;
  removeEventHandler(eventName: string, handler: EventHandler): void;
  removeAllEventHandlers(eventName: string): boolean;

  addAnyEventHandler(handler: EventHandler, order?: HandlerOrder): void;
  removeAnyEventHandler(handler: EventHandler): void;

  addRelatedEventsHandler(events: string[], handler: EventHandler): void;
  removeRelatedEventsHandler(events: string[]): void;

  addEventStream(eventName: string): AsyncIterableIterator<any>;
  removeEventStream(eventName: string): void;

  getEventHandlers(eventName: string, delimiter?: string): Generator<EventHandler, void, undefined>;
  getAnyEventsHandlers(): Generator<EventHandler, void, undefined>;
  handleRelatedEvents(eventName: string, payload: any): Generator<EventHandler>;
  getEventStreamResolver(eventName: string): Generator<EventHandler, void, undefined>;

  getEventsNames(): Generator<string, void, undefined>;
  getRelatedEventNames(): Generator<string[], void, undefined>;
  getEventStreamNames(): Generator<string, void, undefined>;

  getMaxListeners(): number;
  setMaxListeners(maxListeners: number): void;
  getRelatedEventsTimeout(): number;
  setRelatedEventsTimeout(timeout: number): void;
}

export interface EventUnsubscriber<T> {
  eventEmitter: T;
  event: string | string[];
  handler: EventHandler;
  off: () => void;
}

export interface RelatedEvents {
  handler: RelatedEventsHandler;
  eventsData: Record<string, RelatedEventData>;
}

export interface RelatedEventData {
  payload: any;
  firedTimestamp: number;
}

export interface EventStreamHandlers {
  resolver(payload: any): void;
  unsubscriber(): void;
}
