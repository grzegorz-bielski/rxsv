/* eslint-disable functional/immutable-data */
import { ignoreElements, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
    Selector,
} from '@rxsv/core';
import { attachToDevTools } from '@rxsv/tools';

const Actions = U.createUnion(
    U.caseOf('ADD_TODO')<Todo>(),
    U.caseOf('REMOVE_TODO')<Todo['id']>(),
    U.caseOf('UPDATE_TODO')<Todo>(),
);

type Todo = { id: string; text: string; isDone: boolean };

type State = ReturnType<typeof reducer>;
type Actions = ActionsUnion<typeof Actions>;

const initialState: Todo[] = [];
export const reducer = createReducer(initialState)<Actions>({
    ADD_TODO: (state, { payload }) => [...state, payload],
    UPDATE_TODO: (state, { payload }) =>
        state.map(todo => (todo.id === payload.id ? payload : todo)),
    REMOVE_TODO: (state, { payload }) => state.filter(({ id }) => id !== payload),
});

export const effect: Effect<Actions, State> = action$ =>
    action$.pipe(
        fromActions(Actions.ADD_TODO),
        tap(() => console.log('todo added')),
        ignoreElements(),
    );

type ViewInfo = { todo: Todo; length: number };

export const selector: Selector<State, ViewInfo[]> = state$ =>
    combineLatest(
        state$.pipe(select(a => a)), // take part(s) of the state
        state$.pipe(select(a => a.length)),
        (todos, length) => todos.map(todo => ({ todo, length })), // do your projection
    );

const store = createStore(reducer, effect);

attachToDevTools(store).subscribe();

(window as any).store = store;
(window as any).Actions = Actions;

store.state$.subscribe(state => {
    // do sth in your app
});
