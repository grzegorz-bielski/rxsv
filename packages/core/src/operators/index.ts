import { OperatorFunction, Observable } from 'rxjs';
import { map, pluck, distinctUntilChanged, filter } from 'rxjs/operators';

import {
    Action,
    InferActionType,
    Placeholder,
    AnyFunction,
    ExcludeArrayKeys,
    FromArray,
} from '../types';

type Mapper<A, B> = (a: A) => B;
const isMapper = <A, B>(a: Mapper<A, B> | string): a is Mapper<A, B> => typeof a === 'function';

export function select<A, B>(
    pathOrMapper: Mapper<A, B> | string,
    ...paths: readonly string[]
): OperatorFunction<A, B> {
    return source$ =>
        source$.pipe(
            isMapper(pathOrMapper)
                ? map(source => pathOrMapper(source))
                : pluck<A, B>(...[pathOrMapper, ...paths]),
            distinctUntilChanged(),
        );
}

/**
 * ofType will take actions of provided type for the stream
 * If you are using `createActionUnion` or taking more than 3 actions
 * you might consider `fromActions` instead
 */
export function ofType<T extends Action, A0 extends string>(
    a0: A0,
): OperatorFunction<T, InferActionType<T, A0>>;

export function ofType<T extends Action, A0 extends string, A1 extends string>(
    a0: A0,
    a1: A1,
): OperatorFunction<T, InferActionType<T, A0 | A1>>;

export function ofType<T extends Action, A0 extends string, A1 extends string, A2 extends string>(
    a0: A0,
    a1: A1,
    a2: A2,
): OperatorFunction<T, InferActionType<T, A0 | A1 | A2>>;

export function ofType<
    T extends Action,
    A0 extends string,
    A1 extends string,
    A2 extends string,
    A3 extends string
>(a0: A0, a1: A1, a2: A2, a3: A3): OperatorFunction<T, InferActionType<T, A0 | A1 | A2 | A3>>;

export function ofType<T extends Action, A extends string>(
    ...aN: readonly Placeholder[]
): OperatorFunction<T, InferActionType<T, T['type']>>;

export function ofType(...keys: readonly string[]) {
    return (source: Observable<Action>) =>
        source.pipe(filter(action => keys.includes(action.type)));
}

type TypedFunction = AnyFunction & { type: string };
type ActionCreatorType<T> = ReturnType<Extract<T[ExcludeArrayKeys<FromArray<T>>], TypedFunction>>;

export function fromActions<A extends Action, T extends TypedFunction[]>(
    ...actionCreators: T
): OperatorFunction<A, ActionCreatorType<T>> {
    return source =>
        source.pipe(
            filter(action => !!actionCreators.find(({ type }) => type === action.type)),
        ) as Observable<ActionCreatorType<T>>;
}
