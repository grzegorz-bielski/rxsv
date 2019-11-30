import { BehaviorSubject, Observable, Subject } from 'rxjs';

type AnyFunction = (...args: readonly Placeholder[]) => Placeholder;
type AnyFunctionMap = { readonly [key: string]: AnyFunction };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Placeholder = any;

export type Action<T extends string = string, P = void> = P extends void
    ? Readonly<{ type: T }>
    : Readonly<{ type: T; payload: P }>;

export type ActionsUnion<A extends AnyFunctionMap> = ReturnType<A[keyof A]>;

export type Effect<A, S> = (action$: Observable<A>, state: Observable<S>) => Observable<A>;
export type Reducer<A, S> = (state: S | undefined, action: A) => S;
export type Store<A, S> = Readonly<{
    action$: BehaviorSubject<A>;
    state$: Observable<S>;
    effect$: Subject<Effect<A, S>>;
}>;

export type InferActionType<Union, Type extends string> = Union extends Action<Type> ? Union : never;
