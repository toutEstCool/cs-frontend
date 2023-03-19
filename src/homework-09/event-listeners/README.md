# Домашнее задание #9 - Асинхронные итераторы. Реактивные структуры данных

### 1. Реализация функции on, принимающей источник событий и возвращающая асинхронный итератор

Функция выполняет подписку на заданное событие для указанного источника событий, принимает в качестве аргументов любой HTML элемент и имя любого соответствующего этому элементу события:

```ts
on<E extends keyof HTMLElementEventMap>(source: HTMLElement, eventType: E): AsyncIterable<HTMLElementEventMap[E]>
```

Пример использования:

```js
for await (const event of on(document.body, 'click')) {
  console.log(event);
}
```

### 2. Реализация функции once, принимающей источник событий и возвращающая асинхронный итератор

Функция выполняет однократную подписку на заданное событие для указанного источника событий (подписка снимается после срабатывания), принимает в качестве аргументов любой HTML элемент и имя любого соответствующего этому элементу события:

```ts
once<E extends keyof HTMLElementEventMap>(source: HTMLElement, eventType: E): AsyncIterable<HTMLElementEventMap[E]>
```

Пример использования:

```js
for await (const event of once(document.body, 'click')) {
  console.log(event);
}
```

### 3. Реализация функции высшего порядка onlyEvent, принимающей имя события и возвращающую функцию-предикат для сравнения события по типу

```ts
onlyEvent(eventName: string): EventTypePredicate
```

Тип предиката EventTypePredicate:

```ts
export type EventTypePredicate = <T extends Event>(event: T) => boolean;
```
