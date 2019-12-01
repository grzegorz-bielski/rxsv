import { Action, DiscriminateUnion } from '../../types';
import { CreatorList } from './creatorList';
import { InferActionFromList } from './actionFromList';

/**
 * ActionCreator is creating a structure for specific action creator
 * where action and payload are infered thanks to `T` discriminant
 */
export type ActionCreator<C extends CreatorList, T> = CPayload<C, T> extends void
    ? (() => Action<CType<C, T>>) & { type: CType<C, T> }
    : ((payload: CPayload<C, T>) => Action<CType<C, T>, CPayload<C, T>>) & { type: CType<C, T> };

// infers a specific action payload | type from the union discriminated on `T`
type CPayload<C extends CreatorList, T> = DiscriminateAction<C, T>['payload'];
type CType<C extends CreatorList, T> = DiscriminateAction<C, T>['type'];

/**
 * DiscriminateAction infers action based on discriminated on `T` based on action type
 */
type DiscriminateAction<C extends CreatorList, T> = DiscriminateUnion<
    InferActionFromList<C>,
    'type',
    T
>;
