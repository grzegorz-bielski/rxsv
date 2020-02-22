/* eslint-disable functional/immutable-data */
import { ignoreElements, tap, mergeMap, mapTo, delay } from 'rxjs/operators';
import { combineLatest, of, from } from 'rxjs';
import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
    Selector,
    createAction,
    Reducer,
    combineReducers,
} from '@rxsv/core';
import { attachToDevTools } from '@rxsv/tools';

const AsyncActions = U.createUnion(
    U.caseOf('STARTED')(),
    U.caseOf('FAILED')(),
    U.caseOf('FINISHED')(),
);
type AsyncActions = ActionsUnion<typeof AsyncActions>;

const Actions = U.createUnion(
    U.caseOf('ADD_TODO')<Todo>(),
    U.caseOf('REMOVE_TODO')<Todo['id']>(),
    U.caseOf('UPDATE_TODO')<Todo>(),
);
type Todo = { id: string; text: string; isDone: boolean };

type TodoActions = ActionsUnion<typeof Actions>;

type Actions = TodoActions | AsyncActions;
// type State = ReturnType<typeof todosReducer>;

const initialState: Todo[] = [];
export const todosReducer = createReducer(initialState)<TodoActions, Actions>({
    ADD_TODO: (state, { payload }) => [...state, payload],
    UPDATE_TODO: (state, { payload }) =>
        state.map(todo => (todo.id === payload.id ? payload : todo)),
    REMOVE_TODO: (state, { payload }) => state.filter(({ id }) => id !== payload),
});

export const rootReducer = todosReducer;

type State = ReturnType<typeof rootReducer>;

export const effect: Effect<Actions, State> = action$ =>
    action$.pipe(
        fromActions(Actions.ADD_TODO),

        // 🤔somehow effects are logging actions in reverse order when they are mapping to async source..
        mergeMap(() => from(Promise.resolve(AsyncActions.STARTED()))),
    );

type ViewInfo = { todo: Todo; length: number };

export const selector: Selector<State, ViewInfo[]> = state$ =>
    combineLatest(
        state$.pipe(select(a => a)), // take part(s) of the state
        state$.pipe(select(a => a.length)),
        (todos, length) => todos.map(todo => ({ todo, length })), // do your projection
    );

const store = attachToDevTools(createStore(rootReducer, effect));

(window as any).store = store;
(window as any).Actions = Actions;

store.state$.subscribe(state => {
    // do sth in your app

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.querySelector('body')!.innerHTML = JSON.stringify(state);
});
