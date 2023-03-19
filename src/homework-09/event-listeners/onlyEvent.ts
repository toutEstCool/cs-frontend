import type { EventTypePredicate } from '../async-iterator.types';

export default function onlyEvent(eventName: string): EventTypePredicate {
  return function predicate(event) {
    return event.type === eventName;
  };
}
