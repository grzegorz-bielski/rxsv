import { of, empty } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { createStore } from '@rxsv/core';

import { withDevTools } from '../';
import { DevTools } from '../';

const id = <T>(a: T): T => a;
const noOp = (): undefined => void 0;

const testConsole = Object.assign({}, console, { warn: noOp });
const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe('withDevTools', () => {
    it('returns the store if the redux devtools are nowhere to be found', () => {
        const store = createStore(id);
        const enhancedStore = withDevTools(store, testConsole, noOp);

        expect(enhancedStore).toBe(store);
    });

    it('returns enhanced store if devtools are available', () => {
        const store = createStore(id);
        const getExtension = getMockedDevToolExtension();
        const enhancedStore = withDevTools(store, testConsole, getExtension);

        expect(enhancedStore).not.toBe(store);
        expect(getExtension).toHaveBeenCalled();
    });

    it('connects to the devtools extension', () => {
        const store = createStore(id);
        const devToolsAdapterMock = {
            ...DevTools,
            connectTo: jest.fn(() => of({ subscribe: jest.fn(), send: jest.fn() })),
            toStoreState: () => empty(),
            subscribeTo: () => empty(),
        };

        const enhancedStore = withDevTools(
            store,
            testConsole,
            getMockedDevToolExtension(),
            devToolsAdapterMock,
        );

        enhancedStore.state$.subscribe();

        expect(devToolsAdapterMock.connectTo).toHaveBeenCalled();
    });

    it('subscribers to devtools state', () => {
        const action: DevTools.Action<DevTools.UnderlyingAction> = {
            type: 'DISPATCH',
            state: 'kek',
            source: '@devtools-extension',
            payload: { type: 'JUMP_TO_ACTION', actionId: '3' },
        };

        scheduler.run(({ expectObservable, hot }) => {
            const devToolsAction$ = hot('--b', { b: action });

            const store = createStore(id);
            const devToolsAdapterMock = {
                ...DevTools,
                connectTo: jest.fn(() => of({ subscribe: jest.fn(), send: jest.fn() })),
                toStoreState: <T>(x: T) => of(x),
                subscribeTo: () => devToolsAction$,
            } as typeof DevTools;

            const { state$ } = withDevTools(
                store,
                testConsole,
                getMockedDevToolExtension(),
                devToolsAdapterMock,
            );

            const expected$ = 'a-b';

            expectObservable(state$).toBe(expected$, {
                a: void 0,
                b: action.state,
            });
        });
    });
});

function getMockedDevToolExtension(
    connect = jest.fn(),
    disconnect = jest.fn(),
): () => DevTools.Extension {
    return jest.fn(() => ({ connect, disconnect }));
}
