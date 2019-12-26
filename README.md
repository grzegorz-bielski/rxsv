## rxsv

[![Actions Status](https://github.com/{owner}/{repo}/workflows/{workflow_name}/badge.svg)](https://github.com/{owner}/{repo}/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Framework agnostic minimal state management library based on `RxJS`, heavily inspired by `Redux` and `Redux-Observable` with limited boilerplate and TypeScript first approach.

Although the library is framework agnostic and it can be used with any framework, it provides especially smooth integration with `Vue.js` using `vue-rx`.
It has been battle tested in few small to medium projects currently running on production.

### Installation:

```bash
npm install rxjs @rxsv/core
npm install vue-rx # only if you are using vue
```

### Vue Example:

```typescript
///////////////// todo module

// todoState.ts

import {
    U,
    ActionsUnion,
    createReducer,
    Effect,
    fromActions,
    select,
    createStore,
} from '@rxsv/core';

type Todo = { id: string; text: string; isDone: boolean };

// create type-safe actions and action creators in one go using `U`
export const Actions = U.createUnion(
    U.caseOf('ADD_TODO')<Todo>(),
    U.caseOf('REMOVE_TODO')<Todo['id']>(),
    U.caseOf('UPDATE_TODO')<Todo>(),
);

// infer union type of all actions from `U`
type Actions = ActionsUnion<typeof Actions>;

// create reducer function using `createReducer` and infered action union type
// `createReducer` will force you to cover all cases, if you don't want this behaviour consider using simple switch
export const todosReducer = createReducer([] as Todo[])<Actions>({
    ADD_TODO: (state, { payload }) => [...state, payload],
    UPDATE_TODO: (state, { payload }) =>
        state.map(todo => (todo.id === payload.id ? payload : todo)),
    REMOVE_TODO: (state, { payload }) => state.filter(({ id }) => id !== payload),
});

// infer state type from the reducer
type State = ReturnType<typeof reducer>;

// handle side effects using rxjs based sagas.
// The same concept and almost the same (there is no support for DI in rxsv's effects) API as in `https://redux-observable.js.org/`
export const todosEffect: Effect<Actions, State> = (action$, state$) =>
    action$.pipe(
        fromActions(Actions.ADD_TODO),  // fromActions works only with `U`. It will infer the action type from `U` of arbitrary length
        withLatestFrom(state$), // you could access state in a effects like this
        tap(([action, state]) => console.log('todo added'))),
    );

// You can use `reselect` but in most cases you won't need selector library, rxjs is more than enough
// use `select` which has built in memoization, or use `distinctUntilChanged` operator directly
export const todosSelector = (state$: Observable<State>) =>
  combineLatest(
    state$.pipe(select(a => a)), // take part(s) of the state
    state$.pipe(select(a => a.length)),
    (todos, length) => todos.map(todo => ({ todo, length })) // do your projection
  );


///////////////// users module

// usersState.ts

// In most cases you'd want to use `U` and `createReducer`.
// But there are situations when having simple record with `createAction` and switch based reducer is helpful

import { createAction, ActionsUnion } from '@rxsv/core';

const USER_CHANGED = 'USER_CHANGED';

const UserActions = {
    userChanged: () => createAction(USER_CHANGED),
};

export type UserActions = ActionsUnion<typeof UserActions>;

import { Reducer } from '@rxsv/core';
import { AppAction } from '@rootStore';

const initialUserState = {
    sth: '',
};

type UserState = typeof initialUserState;

export const userReducer: Reducer<AppAction, UserState> = (state = initialUserState, action) => {
    switch (action.type) {
        case USER_CHANGED:
            return {
                ...state,
                sth: 'hardcoded',
            };
        default:
            return state;
    }
};

import { ofType } from '@rxsv/core';
import { AppEffect } from '@/rootStore';

const userChangedEffectEffect: AppEffect = action$ =>
    action$.pipe(
        ofType(USER_CHANGED), // `ofType` will work only with simple actions created by `createAction`. It loses type safety for 4 or more elements
        debounceTime(1000),
        mapTo(TodoActions.REMOVE_TODO('1'))
    );

///////////////// rootState.ts

// this is supposed to be root of your applications
// here you can combine application modules, inject dependencies to your effects .etc

import { Store, Effect, combineReducers, combineEffects } from '@rxsv/core';
import { TodosActions, todosReducer, todosEffect } from '@/modules/todos/store';
import { UserActions, usersReducer, usersEffect } from '@/modules/users/store';

// combineReducers works the same way as in `Redux`
// it relies on the `===` comparisment so never mutate your state data!
const rootReducer = combineReducers({ users: usersReducer, todos: usersReducer });

// combineEffects will merge all of your effects into one super-effect 💥 Just as in `Redux-Observable`
const rootEffect = combineEffects(usersEffect, todosEffect);

export const rxStore = createStore(rootReducer, rootEffectFactory);

export type AppAction = VisActions | UserActions;
export type AppState = ReturnType<typeof rootReducer>;
export type AppEffect = Effect<AppAction, AppState>;
export type AppStore = Store<AppAction, AppState>;

///////////////// main.ts
import VueRx from 'vue-rx';
import { rxStore } from '@/rootStore';

Vue.use(VueRx);

// you can set store as a global property for less boilerplate,
// (remember about adding appropriate typings that are extending Vue namespace)
// However such setup doesn't work in the embeddable applications
// and might not be that clear
Vue.prototype.$rxStore = rxStore;
```

### Connecting to the Vue App:

If you don't want global property, the store could be initialized in vue's `Provide` and injected to the components through `Inject`

```vue
<template>
    <div id="App">
        App
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'vue-property-decorator';
import { Observables } from 'vue-rx';
import * as RxSV from 'rxsv';

import { rootReducer, rootEffect, AppStore } from '@/rootStore';

@Component
export default class App extends Vue {
    @Provide('rxstore')
    private get rxStore(): AppStore {
        const store = RxSV.createStore(rootReducer, rootEffect);

        this.$subscribeTo(store.action$, logAction);

        return store;
    }
}
</script>
```

#### Usage in Vue components:

Thanks to the `vue-rx` observables will be unpacked so their values could used without any headache and be passed to the template to render or used as a prop to other components

```vue
<template>
  <p>
    <button @click="onClick">
      dispatch
    </button>
    <SomeOtherComponent :todos="todos$" />
    <p> {{ isInital$ }} </p>
  </p>
</template>

<script lang="ts">
import { Component, Vue,  Inject } from 'vue-property-decorator';
import { select, Store } from 'rxsv';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Observables } from 'vue-rx';

import SomeOtherComponent from './SomeOtherComponent.vue';
import { TodosActions, todosSelector } from '@/modules/visualization/store';
import { AppStore } from '@/rootStore'

@Component<Home>({
    components: {
        SomeOtherComponent,
    },
    subscriptions(): Observables {
        const { state$ } = this.rxStore;

        return {
            todos$: todosSelector(state$),
            isInital$: state$.pipe(
                select(usersSelector),
                map(el => el.length > 0)
            ),
        };
    },
})
export default class Home extends Vue {
    @Inject('store') public readonly rxStore!: AppStore

    private onClick(): void {
        this.rxStore.action$.next(TodosActions.ADD_TODO({ id: 1, text: "kek", isDone: false }));
    }
}
</script>
```
