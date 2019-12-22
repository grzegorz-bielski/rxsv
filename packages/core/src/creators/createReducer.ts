import { Placeholder, Reducer, Action, DiscriminateUnion } from '../types';

export type Reducers<A extends Action, S> = {
    [T in A['type']]: Reducer<DiscriminateUnion<A, 'type', T>, S>;
};

export type ReducersMap = { [key: string]: Reducer<Placeholder, Placeholder> };

export function createReducer<S>(
    defaultState: S,
): <U extends Action>(matching: Reducers<U, S>) => Reducer<U, S> {
    return matching => (state, action) =>
        (matching as ReducersMap)[action.type](state ?? defaultState, action);
}

export const id = <A>(a: A): A => a;
