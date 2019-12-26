import { merge } from 'rxjs';

import { Action, Reducer, Effect, Placeholder } from '../types';

type Reducers<A extends Action, S> = { [K in keyof S]: Reducer<A, S[K]> };
type InferAction<R> = R extends Reducer<infer A, Placeholder> ? A : never;
type InferState<T> = T extends Reducers<Placeholder, infer S> ? S : never;
type InferReducer<T> = T extends Record<Placeholder, infer R> ? R : never;
type CombinedReducer<T> = Reducer<InferAction<InferReducer<T>>, InferState<T>>;

export function combineReducers<T extends Reducers<Placeholder, Placeholder>>(
    reducers: T,
): CombinedReducer<T> {
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
