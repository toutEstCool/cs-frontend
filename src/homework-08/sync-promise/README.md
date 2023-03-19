# Домашнее задание #8 - Асинхронное программирование. Функции обратного вызова. Монадические контейнеры для асинхронного программирования

### 5, 6. Реализация класса SyncPromise с API, аналогичным Promise, но допускающим синхронное выполнение, где это возможно (включая статические методы класса)

Класс SyncPromise реализует контейнерный тип, полностью совместимый с нативным Promise по API. Главное отличие состоит в том, что SyncPromise может выполняться синхронно, если в его цепочке методов не происходит асинхронных вычислений.

Класс реализует методы прототипа then, catch, finally, а также статические методы resolve, reject, all, race, allSettled, any.

Пример использования:

```js
console.log(1);

SyncPromise.resolve(2).then(console.log);

console.log(3);
// 1 2 3

console.log(1);

SyncPromise.resolve(2)
  .then((value) => Promise.resolve(value))
  .then(console.log);

console.log(3);
// 1 3 2

new SyncPromise((resolve) => {
  resolve(1);
})
  .then((value) => value.trim())
  .then((value) => value + 2)
  .catch((error) => {
    console.log(error);
    return 42;
  })
  .finally(() => 'Finally'); // SyncPromise { 42 }

SyncPromise.all([
  SyncPromise.resolve(1),
  Promise.resolve(2),
  SyncPromise((resolve) => {
    setTimeout(resolve, 0, 3);
  }),
]).then(console.log); // [1, 2, 3]
```
