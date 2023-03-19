export default function onlyEvent(eventName) {
  return function predicate(event) {
    return event.type === eventName;
  };
}
