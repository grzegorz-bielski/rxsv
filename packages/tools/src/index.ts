/* eslint-disable functional/no-return-void */
import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
    Selector,
    Action,
    Store,
} from '@rxsv/core';
import { withLatestFrom, map, tap, mapTo } from 'rxjs/operators';

type Unsubscribe = () => void;
type DevToolsAction<T extends string, P, S> = Action<T, P> & { state: S };

interface DevTools {
    readonly subscribe: <T extends string, P, S>(
        fn: (msg: DevToolsAction<T, P, S>) => void,
    ) => Unsubscribe;

    readonly send: <S, A extends Action>(action: A, state: S | null) => void;
}

interface DevToolsExtension {
    readonly connect: () => DevTools;
    readonly disconnect: () => void;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/class-name-casing
    interface Window {
        readonly __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
    }
}

export function attachToDevTools<A extends Action, S>({ action$, state$ }: Store<A, S>): void {
    if (!window.__REDUX_DEVTOOLS_EXTENSION__) {
        return;
    }

    const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();

    state$
        .pipe(
            withLatestFrom(action$),
            tap(([state, action]) => devTools.send(action, state)),
            // mapTo(devTools),
        )
        .subscribe();
}
