/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable functional/no-return-void */
import { Action, Store } from '@rxsv/core';
import { withLatestFrom, tap, mapTo } from 'rxjs/operators';
import { Observable, empty } from 'rxjs';

type Unsubscribe = () => void;
// type

namespace DevTools {
    export type ActionTypes = 'START' | 'DISPATCH' | 'ACTION';
    export type Action<S> = {
        id?: string;
        type: ActionTypes;
        state: S;
        source: '@devtools-extension';
        payload: unknown;
    };
    export type UnderlyingAction =
        | {
              actionId: string;
              type: 'JUMP_TO_ACTION';
          }
        | {
              type: 'COMMIT';
              timestamp: number;
          }
        | {
              type: 'TOGGLE_ACTION';
              id: string;
          };
}

interface DevTools {
    readonly subscribe: <S>(fn: (msg: DevTools.Action<S>) => void) => Unsubscribe;
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

export function getDevToolsExtension(): DevToolsExtension | undefined {
    return window.__REDUX_DEVTOOLS_EXTENSION__;
}

export function attachToDevTools<A extends Action, S>(
    { action$, state$ }: Store<A, S>,
    devToolsExtension = getDevToolsExtension(),
): Observable<DevTools> {
    return !devToolsExtension
        ? empty()
        : new Observable(observer => {
              const devTools = devToolsExtension.connect();
              const storeSubscription = state$
                  .pipe(
                      withLatestFrom(action$),
                      tap(([state, action]) => devTools.send(action, state)),
                      mapTo(devTools),
                  )
                  .subscribe(() => observer.next(devTools));

              const unsubscribeFromDevTools = devTools.subscribe(y => console.log('y', y));

              return () => {
                  storeSubscription.unsubscribe();
                  unsubscribeFromDevTools();
                  devToolsExtension.disconnect();
              };
          });
}
