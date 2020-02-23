/* eslint-disable functional/immutable-data */
import { mergeMap, delay } from 'rxjs/operators';
import { combineLatest, from } from 'rxjs';
import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
    Selector,
    combineReducers,
    combineEffects,
} from '@rxsv/core';
import { withDevTools } from '@rxsv/tools';

const PingPongActions = U.createUnion(U.caseOf('PING')(), U.caseOf('PONG')());
type AsyncActions = ActionsUnion<typeof PingPongActions>;

const TodoActions = U.createUnion(
    U.caseOf('ADD_TODO')<Todo>(),
    U.caseOf('REMOVE_TODO')<Todo['id']>(),
    U.caseOf('UPDATE_TODO')<Todo>(),
);
type Todo = { id: string; text: string; isDone: boolean };
type TodoActions = ActionsUnion<typeof TodoActions>;

const initialState: Todo[] = [];
export const todosReducer = createReducer(initialState)<TodoActions, Actions>({
    ADD_TODO: (state, { payload }) => [...state, payload],
    UPDATE_TODO: (state, { payload }) =>
        state.map(todo => (todo.id === payload.id ? payload : todo)),
    REMOVE_TODO: (state, { payload }) => state.filter(({ id }) => id !== payload),
});

export const isPingReducer = createReducer(false)<AsyncActions, Actions>({
    PING: () => true,
    PONG: () => false,
});

export const rootReducer = combineReducers({
    todos: todosReducer,
    isPing: isPingReducer,
});

type State = ReturnType<typeof rootReducer>;
type Actions = TodoActions | AsyncActions;

export const rootEffect = (): Effect<Actions, State> => {
    const toPing: Effect<Actions, State> = action$ =>
        action$.pipe(
            fromActions(TodoActions.ADD_TODO),
            mergeMap(() => from(Promise.resolve(PingPongActions.PING()))),
        );

    const fromPing: Effect<Actions, State> = action$ =>
        action$.pipe(
            fromActions(PingPongActions.PING),
            mergeMap(() => from(Promise.resolve(PingPongActions.PONG())).pipe(delay(1000))),
        );

    return combineEffects(toPing, fromPing);
};

type ViewInfo = { todo: Todo; length: number };

export const selector: Selector<State, ViewInfo[]> = state$ =>
    combineLatest(
        state$.pipe(select(a => a.todos)), // take part(s) of the state
        state$.pipe(select(a => a.todos.length)),
        (todos, length) => todos.map(todo => ({ todo, length })), // do your projection
    );

const store = withDevTools(createStore(rootReducer, rootEffect()));

(window as any).store = store;
(window as any).Actions = { ...PingPongActions, ...TodoActions };

store.state$.subscribe(state => {
    // do sth in your app

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.querySelector('body')!.innerHTML = JSON.stringify(state);
});
