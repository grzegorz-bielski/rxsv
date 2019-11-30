import { Action, Placeholder } from './types';

type ActionType<T> = T extends [infer A, ...unknown[]] ? A : T;
type Payload<T> = T extends [unknown, infer A, ...unknown[]] ? A : void;
type CreatorList<T extends unknown[] = Placeholder> = {
    [K in keyof T]: (p: Payload<T[K]>) => { type: ActionType<T[K]>; payload: Payload<T[K]> };
};
type Union<T extends unknown[]> = T extends [unknown, ...unknown[]] ? CreatorList<T> : never;
type ExcludeArrayKeys<T> = Exclude<keyof T, keyof unknown[]>;
type InferedActionTypes<
    T extends { readonly [key: string]: (...args: readonly Placeholder[]) => Placeholder }
> = ReturnType<T[keyof T]>;
type InferAction<C extends CreatorList> = InferedActionTypes<Pick<C, ExcludeArrayKeys<C>>>;
type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
type DiscriminateAction<C extends CreatorList, T> = DiscriminateUnion<InferAction<C>, 'type', T>;
type CPayload<C extends CreatorList, T> = DiscriminateAction<C, T>['payload'];
type CType<C extends CreatorList, T> = DiscriminateAction<C, T>['type'];
type ActionCreator<C extends CreatorList, T> = CPayload<C, T> extends void
    ? () => Action<CType<C, T>>
    : (payload: CPayload<C, T>) => Action<CType<C, T>, CPayload<C, T>>;
type Creators<C extends CreatorList> = {
    [T in InferAction<C>['type']]: ActionCreator<C, T>;
};
type ActionCreators<C extends unknown[]> = Creators<Union<C & { [n: number]: Placeholder }>>;

//////

type Foo = ['a', ['b', string], ['cc', { a: number }]];
type FooCreators = ActionCreators<Foo>;

// declare function union<T>(...types: )

// function uni

// const Actions = A.union(
//     ['ADD_TODO', A.payload<{ id: string; text: string }>()],
//     'SET_VISIBILITY_FILTER',
// );

// type Actions = {
//     ADD_TODO: (p: { id: string }) => Action<ADD_TODO, { id: string }>,
//     SET_VISIBILITY_FILTER: () => Action<SET_VISIBILITY_FILTER>
// }

//   A.reduce(
//     {
//       ADD_TODO: (state, p) =>
//     },
//     Actions,
//     (state, action)
//   )
