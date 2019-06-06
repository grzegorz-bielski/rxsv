import { ignoreElements } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

import { createStore, Reducer, Effect } from '../';
import { Observable } from 'rxjs';

const someAction = { type: 'TEST' };
type SomeAction = typeof someAction;

const reducer: Reducer<SomeAction, {}> = (state = {}) => state;
const effect: Effect<SomeAction, {}> = action$ => action$.pipe(ignoreElements());

const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toBe(expected);
});

describe('createStore', () => {
    it('should create action and state streams', () => {
        const store = createStore(reducer, effect);

        expect(store).toBeDefined();
        expect(typeof store).toBe('object');
        expect(store.action$ instanceof Observable).toBe(true);
        expect(store.state$ instanceof Observable).toBe(true);
    });

    it('should emit INIT actions after subscribing', () => {
        // const { action$ } = createStore(reducer, effect);
        // scheduler.run(({ expectObservable, hot }) => {
        //     const source$ = hot('-a-|')
        // })
    });
});
