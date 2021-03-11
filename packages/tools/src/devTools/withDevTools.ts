import { Action as StoreAction, Store } from '@rxsv/core';
import { filter, pluck, mergeMap, distinctUntilKeyChanged, shareReplay } from 'rxjs/operators';
import { Observable, merge } from 'rxjs';
import { DevTools } from './DevTools';

declare global {
    interface Window {
        readonly __REDUX_DEVTOOLS_EXTENSION__?: DevTools.Extension;
    }
}

export function getDefaultDevToolsExtension(): DevTools.Extension | undefined {
    return window?.__REDUX_DEVTOOLS_EXTENSION__;
}

export function withDevTools<A extends StoreAction, S>(
    store: Store<A, S>,
    logger = console,
    getDevToolsExtension = getDefaultDevToolsExtension,
    devTools = DevTools,
): Store<A, S> {
    const devToolsExtension = getDevToolsExtension();

    if (!devToolsExtension) {
        logger.warn(
            `No redux devtools extension found 😿.
            Try reloading the page with the devtools tab open.`,
        );

        return store;
    }

    const devTools$ = devTools.connectTo(devToolsExtension, store);
    const devToolsState$ = devTools$.pipe(
        mergeMap(devTools.subscribeTo),
        filter(devTools.isJumpToAction),
        distinctUntilKeyChanged('state'),
        pluck('state'),
        mergeMap<string, Observable<S>>(devTools.toStoreState),
    );

    return {
        ...store,
        state$: merge(store.state$, devToolsState$).pipe(shareReplay(1)),
    };
}
