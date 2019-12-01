import { Placeholder, ActionsUnion, Reducer, Action, DiscriminateUnion } from '../types';

import * as U from '../union';

type Reducers<A extends Action, S> = {
    [T in A['type']]: Reducer<DiscriminateUnion<A, 'type', T>, S>;
};
type ReducersMap = { [key: string]: Reducer<Placeholder, Placeholder> };

function createReducer<S>(
    defaultState: S,
): <U extends Action>(matching: Reducers<U, S>) => Reducer<U, S> {
    return matching => (state, action) =>
        (matching as ReducersMap)[action.type](state ?? defaultState, action);
}

///

const creators = U.createUnion(
    U.caseOf('ADD_TODO')<{ id: string; text: string }>(),
    U.caseOf('SET_VISIBILITY_FILTER')(),
    U.caseOf('REMOVE_TODO')<{ id: string }>(),
);

type Actions = ActionsUnion<typeof creators>;

creators.SET_VISIBILITY_FILTER.type;
creators.SET_VISIBILITY_FILTER();
creators.ADD_TODO({ id: '', text: '' });

const todoReducer = createReducer({ todos: [] })<Actions>({
    ADD_TODO: (state, action) => {
        const payload = action.payload;
        return { todos: [] };
    },
    // KEK: state => state!,
    REMOVE_TODO: (state, action) => state,
    SET_VISIBILITY_FILTER: (state, action) => state,
    // rwer: state => state,
});

export const id = <A>(a: A): A => a;
