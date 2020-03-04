/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable functional/no-return-void */
import { Action as StoreAction, Store } from '@rxsv/core';
import { withLatestFrom, tap, mapTo, catchError, map } from 'rxjs/operators';
import { Observable, of, empty } from 'rxjs';

/**
 * Redux devtools integrations
 */
export interface DevTools {
    readonly subscribe: <P>(fn: (msg: DevTools.Action<P>) => void) => DevTools.Unsubscribe;
    readonly send: <S, A extends StoreAction>(action: A, state: S | null) => void;
}

export namespace DevTools {
    export type ActionTypes = 'START' | 'DISPATCH' | 'ACTION';
    export type Action<P = unknown> = {
        id?: string;
        type: ActionTypes;
        state: string;
        source: '@devtools-extension';
        payload: P;
    };

    export type Unsubscribe = () => void;

    interface ExtensionOptions {
        name?: string;
    }

    export interface Extension {
        readonly connect: (options?: ExtensionOptions) => DevTools;
        readonly disconnect: () => void;
    }

    type JumpToAction = { type: 'JUMP_TO_ACTION'; actionId: string };
    type Commit = { type: 'COMMIT'; timestamp: number };
    type ToggleAction = { type: 'TOGGLE_ACTION'; id: string };

    export type UnderlyingAction = JumpToAction | Commit | ToggleAction;

    const isUnderlyingAction = (payload: unknown): payload is UnderlyingAction =>
        typeof payload === 'object' && typeof (payload as { type: string })?.type === 'string';

    export const isJumpToAction = (msg: Action<unknown>): msg is Action<UnderlyingAction> =>
        msg.type === 'DISPATCH' &&
        isUnderlyingAction(msg.payload) &&
        msg.payload.type === 'JUMP_TO_ACTION';

    export const connectTo = <A extends StoreAction, S>(
        devToolsExtension: Extension,
        store: Store<A, S>,
    ): Observable<DevTools> =>
        new Observable(observer => {
            const devTools = devToolsExtension.connect({ name: store.name });
            const storeSubscription = store.action$
                .pipe(
                    withLatestFrom(store.state$),
                    tap(([action, state]) => devTools.send(action, state)),
                    mapTo(devTools),
                )
                .subscribe(() => observer.next(devTools));

            return () => {
                storeSubscription.unsubscribe();
                devToolsExtension.disconnect();
            };
        });

    export const toStoreState = <S>(stringifiedState: string): Observable<S> =>
        of(stringifiedState).pipe(
            map(s => JSON.parse(s) as S),
            catchError(() => empty()),
        );

    export const subscribeTo = <P>(devTools: DevTools): Observable<Action<P>> =>
        new Observable(observer => {
            const unsubscribe = devTools.subscribe<P>(action => observer.next(action));

            return () => void unsubscribe();
        });
}
