import { Placeholder, Reducer, Action, DiscriminateUnion } from '../types';

export type Reducers<A extends Action, S> = {
    [T in A['type']]: Reducer<DiscriminateUnion<A, 'type', T>, S>;
};

export type ReducersMap = { [key: string]: Reducer<Placeholder, Placeholder> };

export function createReducer<S>(
    defaultState: S,
): <
    /**
     * `U` represents an union of all action types handled by this particular reducer.
     * User is forced to cover all cases, which makes it a total function for `U`
     */
    U extends Action,
    /**
     * `WU` represents an union of all actions handled by rxsv store this reducer is associated with
     * This allows to keep type safety when using purely side effectful or cross module actions,
     * while preserving the totality check
     */
    WU extends Action = U
>(
    matching: Reducers<U, S>,
) => Reducer<WU, S> {
    return matching => (state, action) => {
        const prevState = state ?? defaultState;
        return (matching as ReducersMap)[action.type]?.(prevState, action) ?? prevState;
    };
}
