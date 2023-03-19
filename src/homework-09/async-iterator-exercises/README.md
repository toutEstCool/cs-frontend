# Домашнее задание #9 - Асинхронные итераторы. Реактивные структуры данных

### 1. Реализация функции take, работающей с асинхронно перебираемыми объектами

Функция принимает аргументами async iterable объект и число итерируемых элементов, возвращает асинхронный перебираемый итератор:

```ts
take<T>(iterable: AsyncIterable<T>, takesCount: number): AsyncIterableIterator<T>
```

Пример использования:

```js
for await (const event of take(on(document.body, 'click'), 3)) {
  console.log(event);
}
```

### 2. Реализация функции map, работающей с асинхронно перебираемыми объектами

Функция принимает аргументами async iterable объект и функцию обратного вызова для отображения итерируемых элементов, возвращает асинхронный перебираемый итератор:

```ts
map<T, M>(iterable: AsyncIterable<T>, mapper: (element: T, index: number, iterable: AsyncIterable<T>) => M): AsyncIterableIterator<M>
```

Пример использования:

```js
for await (const x of map(on(document.body, 'click'), (event) => ({ event.clientX }))) {
  console.log(x);
}
```

### 3. Реализация функции filter, работающей с асинхронно перебираемыми объектами

Функция принимает аргументами async iterable объект и функцию-предикат, возвращает асинхронный перебираемый итератор:

```ts
filter<T>(iterable: AsyncIterable<T>, predicate: (element: T, index: number, iterable: AsyncIterable<T>) => boolean): AsyncIterableIterator<T>
```

Пример использования:

```js
for await (const event of filter(on(document.body, 'click'), (event) => event.clientX > 500)) {
  console.log(event);
}
```

### 4. Реализация функции seq, работающей с асинхронно перебираемыми объектами

Функция принимает один и более async iterable объектов и возвращает асинхронный перебираемый итератор по элементам этих объектов:

```ts
seq<T extends AsyncIterable<any>[]>(...iterables: T): AsyncIterableIterator<ExtractAsyncIterablesType<T>>
```

Пример использования:

```js
for await (const event of seq(once(document.body, 'click'), once(document.body, 'keyup'))) {
  console.log(event);
}
```

### 5. Реализация функции any, возвращающей результат первого разрешенного аснхронного итератора

Функция принимает один и более async iterable объектов и возвращает асинхронный перебираемый итератор с результатом первого разрешенного итератора (аналогично Promise.race):

```ts
any<T extends AsyncIterable<any>[]>(...asyncIterables: T): AsyncIterableIterator<ExtractAsyncIterablesType<T>>
```

Пример использования:

```js
for await (const event of any(once(document.body, 'click'), once(document.body, 'keyup'))) {
  console.log(event);
}
```

### 6. Реализация функции every, перебирающей async iterable объект по условию

Функция принимает аргументами async iterable объект и функцию-предикат, возвращает асинхронный перебираемый итератор, перебор объекта производится до тех пор, пока предикат возвращает истинное значение:

```ts
every<T>(asyncIterable: AsyncIterable<T>, predicate: (value: T) => boolean): AsyncIterableIterator<T>
```

Пример использования:

```js
for await (const event of every(on(document.body, 'click'), onlyEvent('click'))) {
  console.log(event);
}
```

### 7. Реализация функции repeat, бесконечно перебирающей async iterable объект

Функция принимает функцию-источник async iterable объекта, возвращает асинхронный перебираемый итератор, перебор объекта производится циклически:

```ts
repeat<T>(getAsyncIterable: () => AsyncIterable<T>): AsyncIterableIterator<T>
```

Пример использования:

```js
for await (const event of repeat(() => once(document.body, 'click'))) {
  console.log(event);
}
```
