import { map } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
} from '@rxsv/core';

const Actions = U.createUnion(
    U.caseOf('ADD_TODO')<{ id: string; text: string }>(),
    U.caseOf('SET_VISIBILITY_FILTER')(),
    U.caseOf('REMOVE_TODO')<{ id: string }>(),
);

type Actions = ActionsUnion<typeof Actions>;
type State = ReturnType<typeof rootReduer>;

const rootReduer = createReducer({ todos: [] as string[] })<Actions>({
    ADD_TODO: (state, action) => ({ todos: [] }),
    REMOVE_TODO: (state, action) => state,
    SET_VISIBILITY_FILTER: (state, action) => state,
});

const rootEffect: Effect<Actions, State> = action$ =>
    action$.pipe(
        fromActions(Actions.ADD_TODO, Actions.SET_VISIBILITY_FILTER),
        map(x => x),
    );

const selector = (state$: Observable<State>) =>
    combineLatest(
        state$.pipe(select(x => x.todos)),
        state$.pipe(select(x => x.todos.length)),
        (todos, length) => todos.map(todo => ({ todo, length })),
    );

const store = createStore(rootReduer, rootEffect);

store.state$.subscribe(state => {});
