import { Action as StoreAction, Store } from '@rxsv/core';
import { filter, pluck, mergeMap, distinctUntilKeyChanged } from 'rxjs/operators';
import { Observable, merge } from 'rxjs';
import { DevTools } from './DevTools';

declare global {
    interface Window {
        readonly __REDUX_DEVTOOLS_EXTENSION__?: DevTools.Extension;
    }
}

export function getDevToolsExtension(): DevTools.Extension | undefined {
    return window.__REDUX_DEVTOOLS_EXTENSION__;
}

export function withDevTools<A extends StoreAction, S>(
    store: Store<A, S>,
    devToolsExtension = getDevToolsExtension(),
): Store<A, S> {
    if (!devToolsExtension) {
        return store;
    }

    const devTools$ = DevTools.connectTo(devToolsExtension, store);
    const devToolsState$ = devTools$.pipe(
        mergeMap(DevTools.subscribeTo),
        filter(DevTools.isJumpToAction),
        distinctUntilKeyChanged('state'),
        pluck('state'),
        mergeMap<string, Observable<S>>(DevTools.toStoreState),
    );

    return {
        ...store,
        state$: merge(store.state$, devToolsState$),
    };
}
