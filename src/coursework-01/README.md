
## Библиотека EventEmitter с поддержкой пространств-имен, зависимых событий и потоков

Библиотека представляет собой реализацию паттерна Event Emitter, аналогичного таковому, например, из NodeJS, предоставляющая дополнительные возможности (работа с пространствами имён событий, потоки событий и другое).

## Начало работы

Библиотека предоставляет класс `EventEmitter`, для работы необходимо создать экземпляр класса. При создании экземпляра есть возможность дополнительной настройки путём передачи объекта options со следующими возможными свойствами:

- `namespaces: boolean = false` - включение режима поддержки пространств имён событий и замещающих символов (wildcard)
- `namespaceDelimiter: string = '.'` - разделитель для поддоменов пространств имён событий
- `maxListeners: number = 10` - число максимально допустимых зарегистрированных обработчиков на событие (значение 0 - число неограничено)
- `relatedEventsTimeout: number = 0` - максимальное время жизни (в мс) значения, полученного обработчиком связных событий для каждого из связных событий до того, как исполнится переданная функция-обработчик (значение 0 - время жизни неограничено)
- `anyFirst: boolean = false` - определение порядка выполнения обработчиков событий: в первую очередь выполняются обработчики, срабатывающие на любое событие
- `relatedFirst: boolean = false` - определение порядка выполнения обработчиков событий: в первую очередь выполняются обработчики связных событий (если установлен и `anyFirst`, и `relatedFirst`, приоритетнее становится настройка `relatedFirst`)

## Пространства имён событий

`EventEmitter` поддерживает работу с пространствами имён событий, для включения поддержки необходимо передать в конструктор класса объект с соответствующими настройками (см. ["Начало работы"](#начало-работы)). Пространства имён представляют собой строки с заданным типом разделителя, например:

```
- foo
- foo.bar
- foo.bar.bla
```

Кроме того, поддерживаются шаблоны с символами-заместителями (wildcards), как одноуровневыми `*`, так и многоуровневыми `**`. Одноуровневый заместитель может заменять собою любой поддомен имени, например на событие `foo.bar` среагируют обработчики, зарегистрированные со следующими пространствами имён:

```
- foo.bar
- foo.*
- *.foo
- *.*
```

Многоуровневые заместители позволяют заменять любое количество поддоменов (включая ноль). Пример для события `foo.bar`:

```
- foo.**
- foo.bar.**
- **
```

Допускаются комбинации одно- и многоуровневых символов-заместителей. Пример для события `foo.bar.bla.buzz`:

```
- *.*.bla.**
- foo.**.buzz
- **.bla.*
```

На данный момент могут быть проблемы с шаблонами вида `*.*.*.**.*.*`. Разделитель поддоменов по умолчанию - символ точки, может быть задан в объекте настроек при создании экземпляра класса.

## Определения типов и интерфейсы

Некоторые типы и интерфейсы, используемые в сигнатуре методов класса.

Функция-обработчик события:

```ts
type EventHandler = (payload: any) => void;
```

Функция-обработчик связанных событий:

```ts
type RelatedEventsHandler = (...payloads: any[]) => void;
```

Объект, возвращаемый методами подписки на события:

```ts
interface EventUnsubscriber<T> {
  eventEmitter: T;
  event: string | string[];
  handler: EventHandler;
  off: () => void;
}
```

## API

- [`on(eventName: string, handler: EventHandler): EventUnsubscriber<this>`](#oneventname-string-handler-eventhandler-eventunsubscriber)
- [`addListener(eventName: string, handler: EventHandler): EventUnsubscriber<this>`](#addlistenereventname-string-handler-eventhandler-eventunsubscriber)
- [`prependListener(eventName: string, handler: EventHandler): EventUnsubscriber<this>`](#prependlistenereventname-string-handler-eventhandler-eventunsubscriber)
- [`off(eventName: string, handler: EventHandler): void`](#offeventname-string-handler-eventhandler-void)
- [`removeListener(eventName: string, handler: EventHandler): void`](#removelistenereventname-string-handler-eventhandler-void)
- [`removeEvent(eventName: string): boolean`](#removeeventeventname-string-boolean)
- [`any(handler: EventHandler): void`](#anyhandler-eventhandler-void)
- [`prependAny(handler: EventHandler): void`](#prependanyhandler-eventhandler-void)
- [`removeAny(handler: EventHandler): void`](#removeanyhandler-eventhandler-void)
- [`times(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this>`](#timeseventname-string-timescount-number-handler-eventhandler-eventunsubscriber)
- [`prependTimes(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this>`](#prependtimeseventname-string-timescount-number-handler-eventhandler-eventunsubscriber)
- [`once(eventName: string, handler: EventHandler): EventUnsubscriber<this>`](#onceeventname-string-handler-eventhandler-eventunsubscriber)
- [`prependOnce(eventName: string, handler: EventHandler): EventUnsubscriber<this>`](#prependonceeventname-string-handler-eventhandler-eventunsubscriber)
- [`allOf(events: string[], handler: RelatedEventsHandler): EventUnsubscriber<this>`](#allofevents-string-handler-relatedeventshandler-eventunsubscriber)
- [`removeAllOf(events: string[]): void`](#removeallofevents-string-void)
- [`stream(eventName: string): AsyncIterableIterator<any>`](#streameventname-string-asynciterableiterator)
- [`removeStream(eventName: string): void`](#removestreameventname-string-void)
- [`handlers(eventName: string): EventHandler[]`](#handlerseventname-string-eventhandler)
- [`handlersAny(): EventHandler[]`](#handlersany-eventhandler)
- [`eventNames(): string[]`](#eventnames-string)
- [`relatedEventNames(): string[][]`](#relatedeventnames-string)
- [`eventStreamNames(): string[]`](#eventstreamnames-string)
- [`emit(eventName: string, payload: any): void`](#emiteventname-string-payload-any-void)
- [`await(eventName: string): Promise<any>`](#awaiteventname-string-promise)
- [`getMaxListeners(): number`](#getmaxlisteners-number)
- [`setMaxListeners(maxListeners: number): void`](#setmaxlistenersmaxlisteners-number-void)
- [`getRelatedEventsTimeout(): number`](#getrelatedeventstimeout-number)
- [`setRelatedEventsTimeout(timeout: number): void`](#setrelatedeventstimeouttimeout-number-void)

### on(eventName: string, handler: EventHandler): EventUnsubscriber<this>

### addListener(eventName: string, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие `eventName` с обработчиком `handler`:

```ts
ee.on('foo', (value) => {
  console.log(value);
});
```

Метод возвращает объект `EventUnsubscriber`, предоставляющий доступ к экземпляру `EventEmitter`, имени события `event`, функции-обработчику `handler` и методу `off` для отписки от события:

```ts
const event = ee.on('foo', (value) => {
  console.log(value);
});

console.log(event.eventEmitter);
console.log(event.event);
console.log(event.handler);

event.off();
```

### prependListener(eventName: string, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие `eventName` с обработчиком `handler`, функция-обработчик становится в начало списка обработчиков данного события, метод возвращает объект `EventUnsubscriber`:

```ts
const event = ee.prependListener('foo', (value) => {
  console.log(value);
});
```

### off(eventName: string, handler: EventHandler): void

### removeListener(eventName: string, handler: EventHandler): void

Удаление обработчика заданного события:

```ts
const event = 'foo';
const handler = (value) => console.log(value);

ee.on(event, handler);
// ...
ee.off(event, handler);
```

### removeEvent(eventName: string): boolean

Удаление всех обработчиков заданного события:

```ts
const event = 'foo';
const handlerA = (value) => console.log(value);
const handlerB = (value) => console.log(value);

ee.on(event, handlerA);
ee.on(event, handlerB);
// ...
ee.removeEvent(event);
```

### any(handler: EventHandler): void

Регистрация обработчика для прослушивания любого события:

```ts
ee.any((value) => {
  console.log(value);
});
```

### prependAny(handler: EventHandler): void

Регистрация обработчика для прослушивания любого события, функция-обработчик становится в начало списка обработчиков:

```ts
ee.prependAny((value) => {
  console.log(value);
});
```

### removeAny(handler: EventHandler): void

Удаление заданного обработчика, прослушивающего любое событие:

```ts
const handler = (value) => console.log(value);

ee.any(handler);
// ...
ee.removeAny(handler);
```

### times(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие с задаваемым числом срабатывания обработчика. После срабатывания обработчика указанное число раз происходит автоматическое снятие обработчика. Метод возвращает объект `EventUnsubscriber`:

```ts
const event = ee.times('foo', 3, (value) => {
  console.log(value);
});
```

### prependTimes(eventName: string, timesCount: number, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие с задаваемым числом срабатывания обработчика, функция-обработчик становится в начало списка обработчиков данного события:

```ts
const event = ee.prependTimes('foo', 3, (value) => {
  console.log(value);
});
```

### once(eventName: string, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие с однократным срабатыванием обработчика. После срабатывания обработчика происходит автоматическое снятие обработчика. Метод возвращает объект `EventUnsubscriber`:

```ts
const event = ee.once('foo', (value) => {
  console.log(value);
});
```

### prependOnce(eventName: string, handler: EventHandler): EventUnsubscriber<this>

Подписка на событие с однократным срабатыванием обработчика, функция-обработчик становится в начало списка обработчиков данного события:

```ts
const event = ee.prependOnce('foo', (value) => {
  console.log(value);
});
```

### allOf(events: string[], handler: RelatedEventsHandler): EventUnsubscriber<this>

Подписка на связанные события, обработчик будет вызван, когда наступят все события, на которые осуществляется подписка. По умолчанию время жизни данных, полученных при наступлении каждого из отдельных событий не ограничено, но при создании класса можно передать настройку `relatedEventsTimeout`, устанавливающую время жизни данных. Таким образом, если между событиями прошло времени больше, чем регламентируется настройкой обработчик не будет вызван (данные первого события считаются устаревшими). Метод возвращает объект `EventUnsubscriber`:

```ts
const event = ee.allOf(['foo', 'bar'], (a, b) => {
  console.log(a, b);
});
```

### removeAllOf(events: string[]): void

Отписка от прослушивания связанных событий, принимает исходный массив с именами событий:

```ts
const events = ['foo', 'bar'];
ee.allOf(events, (a, b) => {
  console.log(a, b);
});
// ...
ee.removeAllOf(events);
```

### stream(eventName: string): AsyncIterableIterator<any>

Создание потока данных для заданного события, метод реализует интерфейс асинхронного итератора и может использоваться, например, в цикле for await ... of:

```ts
const eventStream = ee.stream('foo.**');
for await (const value of eventStream) {
  // 1, 2
  console.log(value);
}

ee.emit('foo.bar', 1);
ee.emit('foo.bla', 2);
```

Поскольку метод возвращает AsyncIterableIterator, это позволяет использовать композиции из различных функций для работы с последовательностями данных, например, `map`, `filter`, `take` (некоторые из функций предоставляются библиотекой):

```ts
const iterComposition = take(
  map(
    filter(ee.stream('foo.**'), (value: number) => value % 2 === 0),
    (value: number) => value.toString(),
  ),
  5,
);

for await (const value of iterComposition) {
  // '2', '4', '6', '8', '10'
  console.log(value);
}

let counter = 1;
setInterval(() => {
  ee.emit('foo', counter++);
});
```

### removeStream(eventName: string): void

Завершение потока данных для заданного события:

```ts
const eventStream = ee.stream('foo.**');
for await (const value of eventStream) {
  console.log(value);
}
// ...
ee.removeStream('foo.**');
```

### handlers(eventName: string): EventHandler[]

Возвращает массив функций-обработчиков для заданного события

```ts
ee.on('bar', (value) => {
  console.log(value);
});
ee.on('foo', (value) => {
  console.log(value);
});

// [Function, Function]
ee.handlers();
```

### handlersAny(): EventHandler[]

Возвращает массив функций-обработчиков, зарегистрированных для работы с любыми событиями

```ts
ee.any((value) => {
  console.log(value);
});
ee.any((value) => {
  console.log(value);
});

// [Function, Function]
ee.handlersAny();
```

### eventNames(): string[]

Возвращает массив имён событий, на которые была совершена подписка (кроме связанных событий):

```ts
ee.on('foo', (value) => {
  console.log(value);
});
ee.once('bar', (value) => {
  console.log(value);
});

// ['foo', 'bar']
ee.eventNames();
```

### relatedEventNames(): string[][]

Возвращает cписок массивов с именами связанных событий, на которые была совершена подписка:

```ts
ee.allOf(['foo', 'bar'], (a, b) => {
  console.log(a, b);
});
ee.allOf(['bla', 'fizz'], (a, b) => {
  console.log(a, b);
});

// [['foo', 'bar'], ['bla', 'fizz']]
ee.relatedEventNames();
```

### eventStreamNames(): string[]

Возвращает массив с именами зарегистрированных потоков:

```ts
const eventStreamFoo = ee.stream('foo.**');
const eventStreamBar = ee.stream('bar');

// ['foo', 'bar']
ee.eventStreamNames();
```

### emit(eventName: string, payload: any): void

Запускает событие с заданным именем и данными (payload). Порядок обработки событий может отличаться (см. ["Порядок обработки событий"](#порядок-обработки-событий)):

```ts
ee.on('foo', (value) => {
  console.log(value);
});

ee.any((value) => {
  console.log(value);
});

ee.allOf(['bla', 'foo'], (a, b) => {
  console.log(a, b);
});
// ...
ee.emit('foo', 42);
ee.emit('bla', 'hello');
```

### await(eventName: string): Promise<any>

Подписка на указанное событие, метод возвращает Promise:

```ts
ee.await('foo').then((value) => {
  // 42
  console.log(value);
});
// ...
ee.emit('foo', 42);
```

### getMaxListeners(): number

Возвращает число максимального допустимого числа обработчиков, которые могут быть повешены на одно событие:

```ts
ee.getMaxListeners();
```

### setMaxListeners(maxListeners: number): void

Устанавливает число максимального допустимого числа обработчиков, которые могут быть повешены на одно событие. Число должно быть равным или большим нулю, в противном случае выбрасывается исключение типа RangeError. Значение 0 обозначает отсутствие ограничения:

```ts
ee.setMaxListeners(5);
```

### getRelatedEventsTimeout(): number

Возвращает установленную величину таймаута для связанных событий в мс:

```ts
ee.getRelatedEventsTimeout();
```

### setRelatedEventsTimeout(timeout: number): void

Устанавливает величину таймаута для связанных событий в мс. Число должно быть равным или большим нулю, в противном случае выбрасывается исключение типа RangeError. Значение 0 обозначает отсутствие таймаута:

```ts
ee.setRelatedEventsTimeout(20_000);
```

## Порядок обработки событий

В момент распространения события методом `emit` происходит выполнение всех подходящих для этого события зарегистрированных обработчиков. Порядок выполнения по умолчанию такой:

1. Обработчики событий, зарегистрированные по имени события (например, методами `on`, `once`, `times`)
2. Обработчики любых событий
3. Обработчики связанных событий

Посредством настроек `anyFirst` и `relatedFirst` (см. ["Начало работы"](#начало-работы)) данный порядок можно менять. Установка `anyFirst` делает порядок выполнения следующим:

1. Обработчики любых событий
2. Обработчики событий, зарегистрированные по имени события (например, методами `on`, `once`, `times`)
3. Обработчики связанных событий

Установка `relatedFirst` делает порядок выполнения следующим:

1. Обработчики связанных событий
2. Обработчики событий, зарегистрированные по имени события (например, методами `on`, `once`, `times`)
3. Обработчики любых событий

Следует отметить, что при одновременной установке обоих флагов приоритет `relatedFirst` выше, т.е. `anyFirst` будет автоматически установлен в `false`.

Передача данных payload в зарегистрированный поток для события происходит после выполнения всех указанных выше типов обработчиков, кроме того передача данных в поток осуществляется в следующем цикле событий event loop (используется `setTimeout` с нулевой задержкой времени).
