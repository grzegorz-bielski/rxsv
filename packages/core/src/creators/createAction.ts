import { Action } from '../types';

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(type: T, payload: P): Action<T, P>;
export function createAction<T extends string, P>(
    type: T,
    payload?: P,
): Readonly<{ type: T } | { type: T; payload: P }> {
    return payload === void 0 ? { type } : { type, payload };
}
