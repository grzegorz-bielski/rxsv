## rxsv

[![Actions Status](https://github.com/{owner}/{repo}/workflows/{workflow_name}/badge.svg)](https://github.com/{owner}/{repo}/actions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Minimal state management library based on `RxJS` heavily inspired by `Redux` and `Redux-Observable` with `rex-tils`

It's main characteristic is smooth integration with `Vue.js` using `vue-rx` but it's framework agnostic.

### Installation:

```bash
npm install rxjs
npm install vue-rx
## the package is not yet available on the public npm
npm install --registry npm.hal.skygate.io rxsv
```

### Example:

```typescript
///////////////// visualization module
import { ActionsUnion, createAction } from 'rxsv';

// actions.ts
export const USERS_ADDED = '[vis] DATA_ENTRY_ACTIVATED';
export const DATA_ENTRY_DEACTIVATED = '[vis] DATA_ENTRY_DEACTIVATED';

export const VisualizationActions = {
    dataEntryActivated: (value: string) => .createAction(DATA_ENTRY_ACTIVATED, value),
    dataEntryDeactivated: (value: string) => createAction(DATA_ENTRY_DEACTIVATED, value),
};

export type VisualizationActions = ActionsUnion<typeof VisualizationActions>;

// reducers.ts
import { Reducer } from 'rxsv';
import { AppAction } from '@rootStore'

const visState = {
    name: 'initial',
};

type VisState = typeof visState;

export const visReducer: Reducer<AppAction, VisState> = (state = visState, action) => {
    switch (action.type) {
        case DATA_ENTRY_ACTIVATED:
        case DATA_ENTRY_DEACTIVATED:
            return {
                ...state,
                name: action.payload,
            };
        default:
            return state;
    }
};

// effects.ts
import { ofType } from 'rxsv';
import { AppEffect } from '@/rootStore'

const visEffect: AppEffect = (action$, state$) =>
    action$.pipe(
        ofType(DATA_ENTRY_ACTIVATED),
        debounceTime(1000),
        withLatestFrom(state$), // you could access state in a effects like this
        map(([action, state]) => {
            const value = someSelectorFromReselect(state);

            return VisualizationActions.dataEntryDeactivated(value);
        }),
    );

///////////////// users module

// actions.ts
import { createAction, ActionsUnion } from 'rxsv';

const USER_CHANGED = '[user] changed';

const UserActions = {
    userChanged: () => createAction(USER_CHANGED),
};

export type UserActions = ActionsUnion<typeof UserActions>;

// reducers.ts
import { Reducer } from 'rxsv';
import { AppAction } from '@rootStore'

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

// effects.ts
import { ofType } from 'rxsv';
import { AppEffect } from '@/rootStore'

const userChangedEffectEffect: AppEffect = action$ =>
    action$.pipe(
        ofType(USER_CHANGED),
        debounceTime(1000),
        mapTo(VisualizationActions.dataEntryActivated('turn on!')),
    );

///////////////// rootState.ts
import { Store, Effect, combineReducers, combineEffects } from 'rxsv';
import { VisActions } from '@/modules/visualization/store'
import { UserActions } from '@/modules/users/store'

const rootReducer = combineReducers({ users: userReducer, vis: visReducer });
const rootEffect = combineEffects(visEffect, userChangedEffectEffect);

export const rxStore = createStore(rootReducer, rootEffectFactory);

export type AppAction = VisActions | UserActions
export type AppState = ReturnType<typeof rootReducer>;
export type AppEffect = Effect<AppAction, AppState>;
export type AppStore = Store<AppAction, AppState>;

///////////////// main.ts
import VueRx from 'vue-rx';
import { rxStore } from '@/rootStore'

Vue.use(VueRx);

// you can set store as a global property for less boilerplate,
// (remember about adding appropriate typings that are extending Vue namespace)
// However such setup doesn't work in the embeddable applications
// and might not be that clear
Vue.prototype.$rxStore = rxStore
```

### Connecting to the App:

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
    <SomeOtherComponent :title="name$" />
    <p>{{ name$ }}</p>
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
import { VisualizationActions } from '@/modules/visualization/store';
import { AppStore } from '@/rootStore'

@Component<Home>({
    components: {
        SomeOtherComponent,
    },
    subscriptions(): Observables {
        const { state$ } = this.rxStore;

        return {
            name$: state$.pipe(select(visualizationNameSelector),
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
        this.rxStore.action$.next(VisualizationActions.dataEntryActivated('clicked'));
    }
}
</script>
```
