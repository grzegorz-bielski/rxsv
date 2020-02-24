import { DevTools } from '../DevTools';
import { createStore } from '@rxsv/core/src';

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

        // it('sends actions and state to the devtools', () => {
        //     const sendSpy = jest.fn();
        //     const mockDevToolsExtension = mockExtension(sendSpy);
        //     // const store = createStore(() => true);

        //     // DevTools.connectTo(
        //     //     mockDevToolsExtension,
        //     //     createStore(() => true),
        //     // ).subscribe();

        //     // store.action$.next({ type: 'SOME_ACTION' });
        //     // expect(sendSpy).toHaveBeenCalledTimes(1);
        // });
    });
});
