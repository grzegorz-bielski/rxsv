import { DevTools } from '../';
import { createStore } from '@rxsv/core';

describe('DevTools', () => {
    describe('isJumpToAction', () => {
        it('returns false for actions other than `jump to`', () => {
            const results = [
                {
                    type: 'DISPATCH',
                    payload: { type: 'COMMIT' },
                },
                {
                    type: 'START',
                },
                {
                    type: 'ACTION',
                    payload: { type: '' },
                },
            ] as DevTools.Action<unknown>[];

            results.map(DevTools.isJumpToAction).forEach(result => expect(result).toBe(false));
        });

        it('returns true for `jump to` action', () => {
            const result = DevTools.isJumpToAction({
                type: 'DISPATCH',
                payload: { type: 'JUMP_TO_ACTION' },
            } as DevTools.Action<unknown>);

            expect(result).toBe(true);
        });
    });

    describe('connectTo', () => {
        const mockExtension = (send = () => {}): DevTools.Extension => ({
            connect: jest.fn().mockImplementation(() => ({ send })),
            disconnect: jest.fn(),
        });

        it('connects to the store extension', () => {
            const mockDevToolsExtension = mockExtension();

            DevTools.connectTo(
                mockDevToolsExtension,
                createStore(x => x),
            ).subscribe();

            expect(mockDevToolsExtension.connect).toHaveBeenCalled();
        });

        it('disconnects from the store on unsubscribe', () => {
            const mockDevToolsExtension = mockExtension();

            const subscription = DevTools.connectTo(
                mockDevToolsExtension,
                createStore(x => x),
            ).subscribe();

            subscription.unsubscribe();

            expect(mockDevToolsExtension.disconnect).toHaveBeenCalled();
        });

        it('sends actions and state to the devtools', () => {
            const sendSpy: jest.Mock<DevTools['send']> = jest.fn();
            const mockDevToolsExtension = mockExtension(sendSpy);
            const mockAction = { type: 'SOME_ACTION' };
            const store = createStore(() => true);

            DevTools.connectTo(mockDevToolsExtension, store).subscribe();

            store.action$.next(mockAction);
            expect(sendSpy).toHaveBeenCalledTimes(2);
            expect(sendSpy).toHaveBeenNthCalledWith(1, { type: '@@INIT' }, true);
            expect(sendSpy).toHaveBeenNthCalledWith(2, mockAction, true);
        });
    });

    describe('toStoreState', () => {
        it('returns parsed JSON state', done => {
            type MockState = { hello: true };
            const mockState = `{ "hello": true }`;

            DevTools.toStoreState<MockState>(mockState).subscribe(state => {
                expect(state).toEqual(JSON.parse(mockState));
                done();
            });
        });

        it('returns empty observable on error', () => {
            const notValidJSON = `{ kek }`;
            const onNext = jest.fn();
            const onError = jest.fn();
            const onComplete = jest.fn();

            DevTools.toStoreState(notValidJSON).subscribe(onNext, onError, onComplete);

            expect(onNext).not.toHaveBeenCalled();
            expect(onError).not.toHaveBeenCalled();
            expect(onComplete).toHaveBeenCalled();
        });
    });

    describe('subscribeTo', () => {
        it('subscribes to the devTools', () => {
            const mockedDevTools = { subscribe: jest.fn(), send: jest.fn() } as DevTools;

            DevTools.subscribeTo(mockedDevTools).subscribe();

            expect(mockedDevTools.subscribe).toHaveBeenCalled();
        });
    });
});
