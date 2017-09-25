# TODO
#### Experiment with alternative method for scoping reducers/actions. Doesnt really make sense to do:
```typescript
const getTableDataWithAlert = getTableData.merge({
    actionName: "getTableDataWithAlert",
    errorReducer: (state, {payload}) => ({
        ...state,
        alert: payload
    })
})

export default composeReducer(
    scopeReducers({
        table: composeReducer(
            getTableDataWithAlert.reducer
        )
    })
)

```
the name of the action `getTableDataWithAlert` has an implicit relationship with the `table` part of the state, as its not going get called for any other reason, although, not containing scope within actions is also a nice decoupling.