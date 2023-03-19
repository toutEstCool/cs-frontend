# Домашнее задание #8 - Асинхронное программирование. Функции обратного вызова. Монадические контейнеры для асинхронного программирования

### 4. Реализация функции promisify

Функция promisify предназначена для преобразования API функций, предусматривающих асинхронное выполнение с использованием thunk-функций (функция обратного вызова, принимающая в качестве аргументов объект ошибки и результат успешного выполнения операции) в API Promise.

Функция promisify принимает аргументом декорируемую функцию и возвращает асинхронную функцию. Порядок и тип аргументов исходной функции сохраняется (за исключением последнего аргумента - thunk-callback), поддерживается декорация функций с перегрузками (до 4-х):

```ts
promisify<T extends (...args: any[]) => void>(fn: T): Promisified<T>
```

Пример использования:

```js
import { writeFile, readFile, unlink } from 'fs';
import { resolve } from 'path';

const promisifiedWriteFile = promisify(writeFile);
const promisifiedReadFile = promisify(readFile);
const promisifiedUnlinkFile = promisify(unlink);
const filePath = resolve(__dirname, 'data.txt');
const fileData = 'Hello, World!';

const fileHandlePromise = promisifiedWriteFile(filePath, fileData)
  .then(() => promisifiedReadFile(filePath, 'utf-8'))
  .then((data) => promisifiedUnlinkFile(filePath).then(() => `From file: ${data}`));
```
