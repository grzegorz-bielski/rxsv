import { createAction } from '../';

const TEST_ACTION = 'TEST_ACTION';

describe('createAction', () => {
    it('should create action of appropriate type', () => {
        const action = createAction(TEST_ACTION);

        expect(typeof action).toBe('object');
        expect(action.type).toBe(TEST_ACTION);
    });

    it('should not create with payload if provided', () => {
        const action = createAction(TEST_ACTION, 'msg');

        expect(action.payload).not.toBe(undefined);
        expect(action.payload).toBe('msg');
    });
});
