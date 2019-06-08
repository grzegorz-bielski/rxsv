import { BehaviorSubject, Subject, Observable, merge, OperatorFunction } from 'rxjs';
import {
    scan,
    mergeMap,
    shareReplay,
    map,
    distinctUntilChanged,
    pluck,
    filter,
} from 'rxjs/operators';

// tslint:disable:no-any
// tslint:disable:no-mixed-interface

type AnyFunction = (...args: any[]) => any;
interface AnyFunctionMap {
    [key: string]: AnyFunction;
}

export type Action<T extends string = string, P = void> = P extends void
    ? Readonly<{ type: T }>
    : Readonly<{ type: T; payload: P }>;

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(type: T, payload: P): Action<T, P>;
export function createAction<T extends string, P>(
    type: T,
    payload?: P,
): Readonly<{ type: T }> | Readonly<{ type: T; payload: P }> {
    return payload === void 0 ? { type } : { type, payload };
}
export type ActionsUnion<A extends AnyFunctionMap> = ReturnType<A[keyof A]>;

export type Effect<A, S> = (action$: Observable<A>, state: Observable<S>) => Observable<A>;
export type Reducer<A, S> = (state: S | undefined, action: A) => S;
export interface Store<A, S> {
    action$: BehaviorSubject<A>;
    state$: Observable<S>;
}

export function createStore<A extends Action, S>(
    rootReducer: Reducer<A, S>,
    rootEffect?: Effect<A, S>,
): Store<A, S> {
    const action$ = new BehaviorSubject<A>(createAction('@@INIT') as A);
    const effect$ = new Subject<Effect<A, S>>();

    // setup store and reducers
    const state$: Observable<S> = action$.pipe(
        scan(rootReducer, rootReducer(void 0, createAction('@@INIT/state') as A)),
        shareReplay(),
    );

    if (rootEffect) {
        // setup effects pipeline
        effect$
            .pipe(mergeMap(effect => effect(action$, state$)))
            .subscribe(action => action$.next(action));

        effect$.next(rootEffect);
    }

    return {
        action$,
        state$,
    };
}

type Reducers<A extends Action, S> = { [K in keyof S]: Reducer<A, S[K]> };
type InferAction<R> = R extends Reducer<infer A, any> ? A : never;
type InferState<T> = T extends Reducers<any, infer S> ? S : never;
type InferReducer<T> = T extends Record<any, infer R> ? R : never;
type CombinedReducer<T> = Reducer<InferAction<InferReducer<T>>, InferState<T>>;

export function combineReducers<T extends Reducers<any, any>>(reducers: T): CombinedReducer<T> {
    return (prevState = {} as InferState<T>, action) =>
        Object.entries(reducers).reduce((acc, [field, reducer]) => {
            const prevSubState = acc[field];
            const nextSubState = reducer(prevSubState, action);

            return prevSubState !== nextSubState
                ? {
                      ...acc,
                      [field]: nextSubState,
                  }
                : acc;
        }, prevState);
}

export function combineEffects<A, S>(...effects: Array<Effect<A, S>>): Effect<A, S> {
    return (action$, state$) => merge(...effects.map(effect => effect(action$, state$)));
}

export type Mapper<A, B> = (a: A) => B;

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

type InferActionType<Union, Type extends string> = Union extends Action<Type> ? Union : never;

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
