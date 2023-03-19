import type { Immediate } from './set-immediate.types';

export function setImmediateBrowser<T extends any[]>(callback: (...cbArgs: T) => void, ...args: T): Immediate {
  let isCancelled = false;

  queueMicrotask(() => {
    if (!isCancelled) callback(...args);
  });

  return {
    clear() {
      isCancelled = true;
    },
  };
}

export function clearImmediateBrowser(immediate: Immediate): void {
  immediate.clear();
}
