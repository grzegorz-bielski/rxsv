import { AnyPair, Pair, witness } from '../types';
import { createAction } from '../creators/createAction';
import { ActionCreators } from './types/actionCreators';

/**
 * union creates an algebraic data type out of provided cases using `caseOf`.
 * 
 * ```typescript
 * const todos = union(
    caseOf('ADD_TODO')<{ id: string; text: string }>(),
    caseOf('SET_VISIBILITY_FILTER')(),
    caseOf('REMOVE_TODO')<{ id: string }>(),
   );

   type TodosActions = ActionsUnion<typeof todos>;
 * ```
 */
export function createUnion<T extends AnyPair[]>(...values: T): ActionCreators<T> {
    return values.reduce(
        (acc, [type]) => ({
            ...acc,
            [type]: Object.assign(<P>(payload?: P) => createAction(type, payload), { type }),
        }),
        {} as ActionCreators<T>,
    );
}

/**
 *  caseOf creates subtype for action union
 */

export function caseOf<T extends string>(actionType: T): <P = void>() => Pair<T, P> {
    return <P>() => [actionType, witness<P>()];
}
