# Recrux
A functional, action centered, typescript flavored, and slightly opinionated toolbelt for redux.
Core values:

- Compose reducers and actions in a similar way to plain function composition.
- Never trap developers, always allow for plain redux.
- Create actions using a name, namespace and a reducer for that action
- Promote the re-use of reducer logic without complex abstractions


## Examples
### Reducer composition
#### The most basic reducer composition
```javascript
import { composeReducer } from 'recrux'

const GET_DATA = "example/GET_DATA"
const GET_DATA_FULFILL = `${GET_DATA}_FULFILL`
const GET_DATA_ERROR = `${GET_DATA}_ERROR`

const defaultState = {
    data: [],
    error: null,
    loading: false
}

export const baseReducer = composeReducer(
    (state = defaultState) => state,
    (state, {payload, type}) => type === GET_DATA ? ({
        ...state,
        loading: true
    }) : state,
    (state, {payload, type}) => type === GET_DATA_FULFILL ? ({
        ...state,
        loading: false,
        data: payload
    }) : state,
    (state, {payload, type}) => type === GET_DATA_ERROR ? ({
        ...state,
        loading: false,
        error: payload
    }),
    (state, {payload, type}) => {
        switch(type) {
            case "SWITCHEROO":
                return ({
                    ...state,
                    message: "Back to switch statements eh..."
                })
            default:
                return state;
        }
    }
);

export const moreComposition = composeReducer(
    baseReducer,
    (state, action) => action.type === "moreComposition" ? ({
        ...state,
        magic: true
    }) : state
)

```

#### Composition using a map `{ [actionType: string] : Reducer}`
```javascript
import { composeReducer, fromMap } from 'recrux'

const GET_DATA = "example/GET_DATA"
const GET_DATA_FULFILL = `${GET_DATA}_FULFILL`
const GET_DATA_ERROR = `${GET_DATA}_ERROR`

const defaultState = {
    data: [],
    error: null,
    loading: false
}

export default composeReducer(
    (state = defaultState) => state,
    fromMap({
        [GET_DATA]: (state, {payload}) => ({
            ...state,
            loading: true
        }),
        [GET_DATA_FULFILL]: (state, {payload}) => ({
            ...state,
            data: payload,
            loading: false
        }),
        [GET_DATA_ERROR]: (state, {payload}) => ({
            ...state,
            error: payload,
            loading: false
        })
    })
)
```

#### Using action factories
```javascript
// actions.js
import { createAsyncFactory } from 'recrux'
const namespace = "actionDefaults"
export const defaultAsync = createAsyncFactory({
    namespace,
    actionName: "ASYNC_STATE",
    requestReducer: (state, {payload}) => ({
            ...state,
            loading: true
        }),
    fulfillReducer: (state, {payload}) => ({
            ...state,
            data: payload,
            loading: false
        }),
    errorReducer: (state, {payload}) => ({
            ...state,
            error: payload,
            loading: false
        })
})
```

```javascript
// reducer.js

import { createFactory, createAsyncFactory } from 'recrux'
import { defaultAsync } from './actions'

const namespace = "examples"

const defaultState = {
    data: [],
    error: null,
    loading: false
}
const getData = defaultAsync.extend({
    namespace,
    actionName: "GET_DATA"
})

const getDataCustom = createAsyncAction({
    namespace,
    actionName: "GET_DATA_CUSTOM",
    requestReducer: composeReducer(
        getData.requestReducer
    ),
    fulfillReducer: getData.fulfillReducer,
    errorReducer: (state, {payload}) => ({
        ...state,
        dataError: payload
    })
})

export default composeReducer(
    (state = defaultState) => state,
    getData.reducer
)
```


#### More action factories (and with typescript)
```typescript

// Explicit typing of state (or part of the state) is needed when defining an action on its own and you need to use properties within it.
// For example (toggling open state)

const defaultState = {
    right: {
        open: false
    },
    left: {
        open: false
    }
}

type OpenState = typeof defaultState.right

const toggleOpen = createFactory<OpenState>({
    namespace: "myComponent",
    actionName: "sidebarRight",
    reducer: (state) => ({
        ...state,
        open: !state.open
    })
});

```