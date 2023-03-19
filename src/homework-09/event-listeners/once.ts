export default function once<E extends keyof HTMLElementEventMap>(
  source: HTMLElement,
  eventType: E,
): AsyncIterable<HTMLElementEventMap[E]> {
  let isEventFired = false;
  let eventListener: ((event: HTMLElementEventMap[E]) => void) | null = null;

  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          return new Promise((resolve) => {
            if (isEventFired) {
              resolve({ done: true, value: undefined });
              return;
            }

            eventListener = (event: HTMLElementEventMap[E]) => {
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
