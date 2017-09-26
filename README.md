# (WIP) Recrux
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
const getData = defaultAsync.assign({
    namespace,
    actionName: "GET_DATA"
})

export default composeReducer(
    (state = defaultState) => state,
    getData.reducer
)
```


#### Scoping actions
```typescript

// Merge and assign actions (like with objects)
import { createFactory, composeReducer, scopeReducers } from 'recrux'

const namespace = "myComponent"
const defaultState = {
    right: {
        open: false
    },
    left: {
        open: false
    },
    table: {
        data: [],
        error: null,
        loading: false
    }
}

type OpenState = {open: boolean}

const toggleOpenRight = createFactory<OpenState>({
    namespace,
    actionName: "toggleOpenRight",
    reducer: (state) => ({
        ...state,
        open: !state.open
    })
});


const toggleOpenLeft = toggleOpenLeft.assign({
    actionName: "toggleOpenLeft"
})

const getTableData = defaultAsync.assign({
    namespace,
    actionName: "getTableData"
})


// assign will behave like object assign. It wont call parent action reducers if you override it.
// The only thing it will keep in the below example is namespace
const removeTableError = toggleOpenRight.assign({
    actionName: "removeTableError",
    reducer: (state) => ({
        ...state,
        error: null
    })
})


// Merge will also call the reducer from the parent action, even if you pass it as a param
const getTableDataWithAlert = getTableData.merge({
    actionName: "getTableDataWithAlert",
    errorReducer: (state, {payload}) => ({
        ...state,
        alert: payload
    })
})

export default composeReducer(
    (state = defaultState) => state,
    scopeReducers({
        right: toggleOpenRight.reducer,
        left: toggleOpenLeft.reducer,
        table: composeReducer(
            getTableData.reducer,
            getTableDataWithAlert.reducer,
            removeTableError.reducer
        )
    })
)



```
