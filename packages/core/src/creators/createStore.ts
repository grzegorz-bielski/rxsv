import { scan, mergeMap, shareReplay, tap, take, ignoreElements } from 'rxjs/operators';
import { BehaviorSubject, Subject, concat, Observable } from 'rxjs';

import { createAction } from './createAction';
import { Action, Reducer, Store, Effect, witness } from '../types';

export function createStore<A extends Action, S>(
    rootReducer: Reducer<A, S>,
    rootEffect?: Effect<A, S>,
    storeName?: string,
): Store<A, S> {
    const action$ = new BehaviorSubject<A>(createAction('@@INIT') as A);
    const effect$ = new Subject<Effect<A, S>>();

    const _state$ = action$.pipe(
        scan(
            (prevState, action) => rootReducer(prevState, action),
            rootReducer(witness<S>(), createAction('@@INIT/state') as A),
        ),
        shareReplay(1),
    );

    const state$ = _state$.pipe(source$ =>
        // effects initialization will happen only once
        // it is triggered by the first subscriber to the `state$` or `action$`
        concat(source$.pipe(tap(setupEffectsPipeline), take(1), ignoreElements()), source$),
    );

    const name = storeName ?? 'rxsv';

    return {
        action$,
        state$,
        effect$,
        name,
    };

    function setupEffectsPipeline(): void {
        effect$
            .pipe(mergeMap(effect => effect(action$, _state$)))
            .subscribe(action => action$.next(action));

        if (rootEffect) {
            effect$.next(rootEffect);
        }
    }
}
