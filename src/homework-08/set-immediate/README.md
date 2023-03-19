# Домашнее задание #8 - Асинхронное программирование. Функции обратного вызова. Монадические контейнеры для асинхронного программирования

### 3. Реализация функций setImmediate и clearImmediate

Реализация представлена функциями setImmediateBrowser и clearImmediateBrowser и является наивной реализацией соответствующих функций NodeJS (использует функцию queueMicrotask).

Функция setImmediateBrowser принимает функцию обратного вызова и список аргументов, которые необходимо передать ей в момент вызова, возвращает объект Immediate:

```ts
setImmediateBrowser<T extends any[]>(callback: (...cbArgs: T) => void, ...args: T): Immediate
```

Объект Immediate используется для отмены запланированного выполнения функции обратного вызова, для этого его необходимо передать в функцию clearImmediateBrowser:

```ts
clearImmediateBrowser(immediate: Immediate): void
```

Пример использования:

```js
const immediate = setImmediateBrowser(
  (...args) => {
    console.log(args);
  },
  1,
  2,
  3,
);

clearImmediateBrowser(immediate);
```
