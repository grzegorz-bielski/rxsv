import { Placeholder } from '../../types';
import { CreatorList } from './creatorList';

/**
 * InferActionFromList infers action union from the creators list
 */
export type InferActionFromList<C extends CreatorList> = InferActionFromCreatorList<
    Pick<C, ExcludeArrayKeys<C>>
>;

/**
 * ExcludeArrayKeys excludes native array keys from the tuple
 */
type ExcludeArrayKeys<T> = Exclude<keyof T, keyof unknown[]>;

type InferActionFromCreatorList<
    T extends { readonly [key: string]: (...args: readonly Placeholder[]) => Placeholder }
> = ReturnType<T[keyof T]>;
