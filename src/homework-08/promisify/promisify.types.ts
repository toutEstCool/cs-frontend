type FunctionOverloadsArgs<T> = T extends {
  (...o: infer U1): void;
  (...o: infer U2): void;
  (...o: infer U3): void;
  (...o: infer U4): void;
}
  ? U1 | U2 | U3 | U4
  : T extends { (...o: infer U1): void; (...o: infer U2): void; (...o: infer U3): void }
  ? U1 | U2 | U3
  : T extends { (...o: infer U1): void; (...o: infer U2): void }
  ? U1 | U2
  : T extends { (...o: infer U1): void }
  ? U1
  : never;

export type Thunk<V> = (err: Error | null, value?: V) => void;

type PureArgs<Args extends any[]> = Args extends [Thunk<any>?]
  ? []
  : Args extends [infer A0, Thunk<any>?]
  ? [A0]
  : Args extends [infer A0, infer A1, Thunk<any>?]
  ? [A0, A1]
  : Args extends [infer A0, infer A1, infer A2, Thunk<any>?]
  ? [A0, A1, A2]
  : Args extends [infer A0, infer A1, infer A2, infer A3, Thunk<any>?]
  ? [A0, A1, A2, A3]
  : Args;

export type ThunkValue<T extends (...args: any[]) => void> = Parameters<T> extends
  | [Thunk<infer R>]
  | [...any[], Thunk<infer R>]
  ? R
  : never;

export type Promisified<T extends (...args: any[]) => void> = (
  ...args: PureArgs<FunctionOverloadsArgs<T>>
) => Promise<ThunkValue<T>>;
