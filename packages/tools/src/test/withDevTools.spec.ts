import { createStore } from '@rxsv/core';
import { withDevTools } from '../';
import { DevTools } from '../';

const id = <T>(a: T): T => a;
const noOp = (): undefined => void 0;

const testConsole = Object.assign({}, console, { warn: noOp });

describe('withDevTools', () => {
    it('returns the store if the redux devtools are nowhere to be found', () => {
        const store = createStore(id);
        const enhancedStore = withDevTools(store, testConsole, noOp);

        expect(enhancedStore).toBe(store);
    });

    it('returns enhanced store if devtools are available', () => {
        const store = createStore(id);
        const connectMock = jest.fn();
        const disconnectMock = jest.fn();

        const getMockedDevToolExtension = jest.fn(() => ({
            connect: connectMock,
            disconnect: disconnectMock,
        }));

        const enhancedStore = withDevTools(store, testConsole, getMockedDevToolExtension);

        expect(enhancedStore).not.toBe(store);
        expect(getMockedDevToolExtension).toHaveBeenCalled();
    });
});
