export type ExtractAsyncIterablesType<T extends AsyncIterable<unknown>[]> = T[number] extends AsyncIterable<infer U>
  ? U
  : unknown;
