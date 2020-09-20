import { createReducer, createAction } from '../creators';
import * as U from '../union';
import { ActionsUnion, witness, Reducer } from '../types';

describe('createReducer', () => {
    const Actions = U.createUnion(
        U.caseOf('ADD_TODO')<Todo>(),
        U.caseOf('REMOVE_TODO')<Todo['id']>(),
    );

    type Todo = { id: string; text: string };
    type Actions = ActionsUnion<typeof Actions>;

    const initialState: Todo[] = [];
    const reducer = createReducer(initialState)<Actions>({
        ADD_TODO: (state, { payload }) => [...state, payload],
        REMOVE_TODO: (state, { payload }) => state.filter(({ id }) => id !== payload),
    });

    const payload = { id: '1', text: 'kek' };

    it('invokes appropriate function based on action type', () => {
        const newState = reducer([], Actions.ADD_TODO(payload));

        expect(newState[0]).toBeDefined();
        expect(newState[0]).toBe(payload);
    });

    it('returns previous/default state if the provided is undefined', () => {
        const newState = reducer(witness(), Actions.ADD_TODO(payload));

        expect(newState[0]).toBeDefined();
        expect(newState[0]).toBe(payload);
    });

    it('returns previous/default state if provided action is not matching any case', () => {
        const otherAction = createAction('OTHER');

        const allActionsReducer = reducer as Reducer<Actions | typeof otherAction, Todo[]>;

        const newState = allActionsReducer([], otherAction);

        expect(newState).toEqual([]);
    });
});
