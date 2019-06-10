import { OperatorFunction, Observable } from 'rxjs';
import { map, pluck, distinctUntilChanged, filter } from 'rxjs/operators';

import { Action, InferActionType } from './types';

type Mapper<A, B> = (a: A) => B;

export function select<A, B>(
    pathOrMapper: Mapper<A, B> | string,
    ...paths: string[]
): OperatorFunction<A, B> {
    const haveMapperFunc = typeof pathOrMapper === 'function';

    return source$ =>
        source$.pipe(
            haveMapperFunc
                ? map(source => (pathOrMapper as Mapper<A, B>)(source))
                : pluck<A, B>(...[pathOrMapper as string, ...paths]),
            distinctUntilChanged(),
        );
}

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
    ...aN: any[]
): OperatorFunction<T, InferActionType<T, T['type']>>;

// tslint:disable:typedef
export function ofType(...keys: string[]) {
    return (source: Observable<Action>) =>
        source.pipe(filter(action => keys.includes(action.type)));
}
