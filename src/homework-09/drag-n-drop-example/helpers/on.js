export default function on(source, eventType) {
  let eventListener = null;
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          return new Promise((resolve) => {
            eventListener = (event) => {
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
