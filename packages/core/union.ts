import { Action, Placeholder } from './types';
import { createAction } from './createAction';

type ActionType<T> = T extends [infer A, ...unknown[]] ? A : T;
type Payload<T> = T extends [unknown, infer A, ...unknown[]] ? A : void;
type CreatorList<T extends unknown[] = Placeholder> = {
    [K in keyof T]: (p: Payload<T[K]>) => { type: ActionType<T[K]>; payload: Payload<T[K]> };
};

type Union<T extends unknown[]> = T extends [unknown, ...unknown[]] ? CreatorList<T> : never;
type ExcludeArrayKeys<T> = Exclude<keyof T, keyof unknown[]>;
type InferedActionTypes<
    T extends { readonly [key: string]: (...args: readonly Placeholder[]) => Placeholder }
> = ReturnType<T[keyof T]>;
type InferAction<C extends CreatorList> = InferedActionTypes<Pick<C, ExcludeArrayKeys<C>>>;

type DiscriminateUnion<T, K extends keyof T, V extends T[K]> = T extends Record<K, V> ? T : never;
type DiscriminateAction<C extends CreatorList, T> = DiscriminateUnion<InferAction<C>, 'type', T>;

type CPayload<C extends CreatorList, T> = DiscriminateAction<C, T>['payload'];
type CType<C extends CreatorList, T> = DiscriminateAction<C, T>['type'];

type ActionCreator<C extends CreatorList, T> = CPayload<C, T> extends void
    ? () => Action<CType<C, T>>
    : (payload: CPayload<C, T>) => Action<CType<C, T>, CPayload<C, T>>;
type Creators<C extends CreatorList> = { [T in InferAction<C>['type']]: ActionCreator<C, T> };
type ActionCreators<C extends unknown[]> = Creators<Union<C>>;

//////

export const witness = <T>(): T => void 'non runtime value' as Placeholder;

export const ofType = <T extends string>(type: T) => <P = void>(): [T, P] => [type, witness<P>()];

export function union<T extends Placeholder[]>(
    ...values: T
): ActionCreators<{ [P in keyof T]: T[P] }> {
    return values.reduce(
        (acc, type) => ({
            ...acc,
            [type]: Object.assign(<P>(payload?: P) => createAction(type, payload), { type }),
        }),
        {},
    );
}

const creators = union(
    ofType('ADD_TODO')<{ id: string; text: string }>(),
    ofType('SET_VISIBILITY_FILTER')(),
    ofType('KEK')(),
);

// type kek = ReturnType<typeof creators['SET_VISIBILITY_FILTER']>;

creators.SET_VISIBILITY_FILTER();
// creators.SET_VISIBILITY_FILTER.type

creators.ADD_TODO({ id: '', text: '' });
// creators.ADD_TODO();
creators.KEK();

// const Actions = A.union(
// ['ADD_TODO', A.payload<{ id: string; text: string }>()],
// 'SET_VISIBILITY_FILTER',
// );

// const Actions = A.union(
//     A.case('ADD_TODO')<{ id: string; text: string }>(),
//     A.case('SET_VISIBILITY_FILTER'),
// );

// type Actions = {
//     ADD_TODO: (p: { id: string }) => Action<ADD_TODO, { id: string }>,
//     SET_VISIBILITY_FILTER: () => Action<SET_VISIBILITY_FILTER>
// }

//   A.reduce(
//     creators,
//     {
//       ADD_TODO: (state, p) =>
//     },
//     (state, action)
//   )
