export default function once(source, eventType) {
  let isEventFired = false;
  let eventListener = null;
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          return new Promise((resolve) => {
            if (isEventFired) {
              resolve({ done: true, value: undefined });
              return;
            }
            eventListener = (event) => {
              isEventFired = true;
              resolve({ done: false, value: event });
            };
            source.addEventListener(eventType, eventListener, { once: true });
          });
        },
        async return() {
          if (eventListener != null) source.removeEventListener(eventType, eventListener);
          return { done: true, value: undefined };
        },
      };
    },
  };
}
