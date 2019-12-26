import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type AnyFunction = (...args: readonly Placeholder[]) => Placeholder;
export type AnyFunctionMap = { readonly [key: string]: AnyFunction };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Placeholder = any;

/**
 * Action represents a store action type
 */
export type Action<T extends string = string, P = void> = P extends void
    ? Readonly<{ type: T }>
    : Readonly<{ type: T; payload: P }>;

/**
 * ActionsUnion infers action union type from the action creators record
 */
export type ActionsUnion<A extends AnyFunctionMap> = ReturnType<A[keyof A]>;

/**
 * Effect represents a store effect saga
 */
export type Effect<A, S> = (action$: Observable<A>, state: Observable<S>) => Observable<A>;

/**
 * Reducer represents a store function for deriving new state from the current state and dispatched action
 */
export type Reducer<A, S> = (state: S, action: A) => S;

export type Selector<S, R> = (state$: Observable<S>) => Observable<R>;

/**
 * Store represents an instance of related application logic
 */
export type Store<A, S> = Readonly<{
    action$: BehaviorSubject<A>;
    state$: Observable<S>;
    effect$: Subject<Effect<A, S>>;
}>;

/**
 * InferActionType infers action type from the action union
 */
export type InferActionType<Union, Type extends string> = Union extends Action<Type>
    ? Union
    : never;

/**
 * Generic tuple
 */
export type Pair<A, B> = [A, B];
export type AnyPair = Pair<Placeholder, Placeholder>;

/**
 * DiscriminateUnion infers a type from `U` union based on the `K` property where `V` is matched value
 */
export type DiscriminateUnion<U, K extends keyof U, V extends U[K]> = U extends Record<K, V>
    ? U
    : never;

/**
 * ExcludeArrayKeys excludes native array keys from the tuple
 */
export type ExcludeArrayKeys<T> = Exclude<keyof T, keyof unknown[]>;

/**
 * FromArray creates a n length tuple from every array key
 */
export type FromArray<T> = { [P in keyof T]: T[P] };

/**
 * witness is a type assertion function
 * https://wiki.haskell.org/Type_witness
 */
export function witness<T>(): T {
    return void 'non runtime value' as Placeholder;
}
