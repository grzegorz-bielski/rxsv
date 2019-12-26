import { CreatorList } from './creatorList';
import { InferActionFromList } from './actionFromList';
import { ActionCreator } from './actionCreator';
import { FromArray } from '../../types';

/**
 * ActionCreators is constructing a record with action creatores from given pair list
 */
export type ActionCreators<C extends unknown[]> = Creators<CreatorList<FromArray<C>>>;

/**
 * Creators creates a record with action types as keys and values as action creators associated with given type
 */
type Creators<C extends CreatorList> = {
    [T in InferActionFromList<C>['type']]: ActionCreator<C, T>;
};
