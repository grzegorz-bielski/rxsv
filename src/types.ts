import { BehaviorSubject, Observable } from 'rxjs';

type AnyFunction = (...args: any[]) => any;
interface AnyFunctionMap {
    [key: string]: AnyFunction;
}

export type Action<T extends string = string, P = void> = P extends void
    ? Readonly<{ type: T }>
    : Readonly<{ type: T; payload: P }>;

export type ActionsUnion<A extends AnyFunctionMap> = ReturnType<A[keyof A]>;

export type Effect<A, S> = (action$: Observable<A>, state: Observable<S>) => Observable<A>;
export type Reducer<A, S> = (state: S | undefined, action: A) => S;
export interface Store<A, S> {
    readonly action$: BehaviorSubject<A>;
    readonly state$: Observable<S>;
}

export type InferActionType<Union, Type extends string> = Union extends Action<Type>
    ? Union
    : never;
