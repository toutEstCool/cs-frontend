# Домашнее задание #9 - Асинхронные итераторы. Реактивные структуры данных

### Реализация функций take, map, filter, seq, every, repeat на базе асинхронных генераторов

Данные функции имеют назначение и сигнатуру, аналогичную таковым из async-iterator-exercises, за исключением возвращаемого значения - функции возвращают объект асинхронного генератора:

```ts
take<T>(iterable: AsyncIterable<T>, takesCount: number): AsyncGenerator<T>

map<T, M>(iterable: AsyncIterable<T>, mapper: (element: T, index: number, iterable: AsyncIterable<T>) => M): AsyncGenerator<M>

filter<T>(iterable: AsyncIterable<T>, predicate: (element: T, index: number, iterable: AsyncIterable<T>) => boolean): AsyncGenerator<T>

seq<T extends AsyncIterable<any>[]>(...iterables: T): AsyncGenerator<ExtractAsyncIterablesType<T>, void, undefined>

every<T>(asyncIterable: AsyncIterable<T>, predicate: (value: T) => boolean): AsyncGenerator<T>

repeat<T>(getAsyncIterable: () => AsyncIterable<T>): AsyncGenerator<T, void, undefined>
```
