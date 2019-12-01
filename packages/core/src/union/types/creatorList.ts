import { Placeholder } from '../../types';

/**
 * CreatorList infers general action creator structure from the pair list
 */
export type CreatorList<T extends unknown[] = Placeholder> = {
    [K in keyof T]: (
        p: InferPairActionPayload<T[K]>,
    ) => { type: InferPairActionType<T[K]>; payload: InferPairActionPayload<T[K]> };
};

type InferPairActionType<T> = T extends [infer A, ...unknown[]] ? A : T;
type InferPairActionPayload<T> = T extends [unknown, infer A, ...unknown[]] ? A : void;
