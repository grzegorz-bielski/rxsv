import { Observable, of } from 'rxjs';

import { Reducer } from '../types';
import { combineReducers, combineEffects } from '../combiners';

describe('combiners', () => {
    const action = { type: 'NOOP' };

    describe('combineReducers', () => {
        const sthReducer: Reducer<typeof action, {}> = (state = { sth: 'kek' }, _action) => state;
        const sthElseReducer: Reducer<typeof action, {}> = (state = {}, _action) => state;

        const reducersMap = {
            sth: sthReducer,
            sthElse: sthElseReducer,
        };

        it('creates new function', () => {
            const combined = combineReducers(reducersMap);

            expect(typeof combined).toBe('function');
        });

        it('should initialize all combined reducers', () => {
            const initState = combineReducers(reducersMap)(void 0, action);

            expect(initState).toEqual({
                sth: { sth: 'kek' },
                sthElse: {},
            });
        });

        it('should return old object if the reference has not changed', () => {
            const mutAction = { type: 'MUTATION' };
            const pureAction = { type: 'NO_MUTATION' };

            const init = { sth: 'kek', kek: false };
            const nonPureReducer: Reducer<typeof action, typeof init> = (state = init, _action) => {
                if (action.type === 'MUTATION') {
                    state.kek = true;
                }

                if (action.type === 'NO_MUTATION') {
                    return {
                        ...state,
                        kek: true,
                    };
                }

                return state;
            };

            const combined = combineReducers({
                sth: nonPureReducer,
            });

            const initState = combined(void 0, action);
            const mutState = combined(initState, mutAction);
            const pureState = combined(initState, pureAction);

            expect(init).toBe(initState.sth);
            expect(init).toBe(mutState.sth);

            expect(init).toBe(pureState.sth);
            expect(pureState.sth.kek).toBe(false);
        });
    });

    describe('combineEffects', () => {
        it('merges all effects', () => {
            const effectMockOne = jest.fn();
            const effectMockTwo = jest.fn();

            const combined = combineEffects(effectMockOne, effectMockTwo);

            expect(typeof combined).toBe('function');

            const effect$ = combined(of(action), of({}));

            expect(effect$ instanceof Observable).toBe(true);

            expect(effectMockOne).toHaveBeenCalledTimes(1);
            expect(effectMockTwo).toHaveBeenCalledTimes(1);
        });
    });
});
