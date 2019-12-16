import { Placeholder, ActionsUnion, Reducer, Action, DiscriminateUnion } from '../types';

import * as U from '../union';
import { Effect } from '../../dist/esm';
import { ofType, fromActions, select } from '../operators';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { createStore } from './createStore';

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

//

const Actions = U.createUnion(
    U.caseOf('ADD_TODO')<{ id: string; text: string }>(),
    U.caseOf('SET_VISIBILITY_FILTER')(),
    U.caseOf('REMOVE_TODO')<{ id: string }>(),
);

type Actions = ActionsUnion<typeof Actions>;
type State = ReturnType<typeof rootReduer>;

// Actions.SET_VISIBILITY_FILTER.type;
// Actions.SET_VISIBILITY_FILTER();
// Actions.ADD_TODO({ id: '', text: '' });

const rootReduer = createReducer({ todos: [] as string[] })<Actions>({
    ADD_TODO: (state, action) => {
        const payload = action.payload;
        return { todos: [] };
    },
    // KEK: state => state!,
    REMOVE_TODO: (state, action) => state,
    SET_VISIBILITY_FILTER: (state, action) => state,
    // rwer: state => state,
});

const rootEffect: Effect<Actions, State> = action$ =>
    action$.pipe(
        fromActions(Actions.ADD_TODO, Actions.SET_VISIBILITY_FILTER),
        map(x => x),
    );

// const x = createSelector(
//     x => x.todos,
//     x => x.todos.length,
//     (todos, length) => todos.map(x => legth)
// )

// const selector = (state$: Observable<State>) => state$.pipe(select(x => x.todos));

const store = createStore(rootReduer, rootEffect);
