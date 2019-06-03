## rxsv

Minimal state management library based on `RxJS` heavily inspired by `Redux` and `Redux-Observable`.

It's main characteristic is smooth integration with `Vue.js` using `vue-rx` and small boilerplate.

### Installation:

```bash
npm install rxjs
npm install vue-rx # if you are using vue
npm install --registry npm.hal.skygate.io rxsv
```

### Example:

work in progress...

```typescript
import VueRx from 'vue-rx';
import * as RxSV from 'rxsv/src'; // temp

Vue.use(VueRx);

///////////////// some module A

// actions
export const DATA_ENTRY_ACTIVATED = '[vis] DATA_ENTRY_ACTIVATED';
export const DATA_ENTRY_DEACTIVATED = '[vis] DATA_ENTRY_DEACTIVATED';

// action creatores
export const VisualizationActions = {
    dataEntryActivated: (value: string) => RxSV.createAction(DATA_ENTRY_ACTIVATED, value),
    dataEntryDeactivated: (value: string) => RxSV.createAction(DATA_ENTRY_DEACTIVATED, value),
};

export type VisualizationActions = RxSV.ActionsUnion<typeof VisualizationActions>;

// reducer
const visState = {
    name: 'initial',
};

export type VisState = typeof visState;

export const visReducer: RxSV.Reducer<AppAction, VisState> = (state = visState, action) => {
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

///////////////// some module B

// actions
const USER_CHANGED = '[user] changed';

const UserActions = {
    userChanged: () => createAction(USER_CHANGED),
};

export type UserActions = ActionsUnion<typeof UserActions>;

// reducer
const initialUserState = {
    namek: '',
};

export type UserState = typeof initialUserState;

export const userReducer: Reducer<AppAction, UserState> = (state = initialUserState, action) => {
    switch (action.type) {
        case USER_CHANGED:
            return {
                ...state,
                namek: 'hardcoded',
            };
        default:
            return state;
    }
};

///////////////// root

// combined reducers
const rootReducer = combineReducers({
    users: userReducer,
    vis: visReducer,
});

// root types
export type AppState = ReturnType<typeof rootReducer>;
export type AppEffect = Effect<AppAction, AppState>;

// combined effects/epics (iin real app they should be imported from modules)
const rootEffectFactory = (): AppEffect => {
    const activatedEffect: AppEffect = (action$, state$) =>
        action$.pipe(
            filter(({ type }) => type === DATA_ENTRY_ACTIVATED),
            debounceTime(1000),
            withLatestFrom(state$), // you could access state in a effect like this
            map(([_, state]) => VisualizationActions.dataEntryDeactivated(`turn off!`)),
        );

    const deactivatedEffect: AppEffect = action$ =>
        action$.pipe(
            filter(({ type }) => type === DATA_ENTRY_DEACTIVATED),
            debounceTime(1000),
            mapTo(VisualizationActions.dataEntryActivated('turn on!')),
        );

    return combineEffects(activatedEffect, deactivatedEffect);
};

export const rxStore = createStore(rootReducer, rootEffectFactory());
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
import { map, pluck, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Observables } from 'vue-rx';

import SomeOtherComponent from './SomeOtherComponent.vue';
import { VisualizationActions, AppState, AppAction } from '@/main';
import { select, Mapper, Store } from '@/config/rxs';

@Component<Home>({
    components: {
        SomeOtherComponent,
    },
    subscriptions(): Observables {
        const { state$ } = this.rxStore;

        return {
            name$: state$.pipe(select('vis', 'name')),
            isInital$: state$.pipe(select(({ users: { namek } }) => namek === 'initial')),
        };
    },
})
export default class Home extends Vue {
    @Inject() public readonly rxStore!: Store<AppAction, AppState>;

    private onClick(): void {
        this.rxStore.action$.next(VisualizationActions.dataEntryActivated('clicked'));
    }
}
</script>
```

### Todo:

-   tests
