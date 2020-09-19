# `tools`

A utility package for the `rxsv`.

```bash
npm install rxjs @rxsv/core @rxsv/tools
```

### `withDevTools`

Connect to the [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension)

Supported features:

-   listening to the `rxsv` actions and displaying the current state
-   time travel debugging

```typescript
import { createStore } from '@rxsv/core';
import { withDevTools } from '@rxsv/tools';

const store = createStore(a => a);
const enhancedStore = withDevTools(store);
```

You can connect multiple `rxsv` stores to the devtools. They can be distinguished by passing a custom name.

```typescript
const store = createStore(reducer, effect, 'ui-widget');
```
