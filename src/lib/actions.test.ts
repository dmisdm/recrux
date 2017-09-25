import { createStore } from "redux";

import { createAsyncFactory, createFactory } from "./actions";
import { Action, composeReducer, scopeReducers } from "./composition";
import { initialTestState, ITestState } from "./testData";

export const defaultAsync = createAsyncFactory({
  namespace: "actionDefaults",
  actionName: "ASYNC_STATE",
  requestReducer: (state, { payload }) => ({
    ...state,
    loading: true
  }),
  fulfillReducer: (state, { payload }) => ({
    ...state,
    data: payload,
    loading: false
  }),
  errorReducer: (state, { payload }) => ({
    ...state,
    error: payload,
    loading: false
  })
});

describe("Action creators", () => {
  it("createFactory works", () => {
    const reduce = (state: ITestState) => ({ ...state, hey: "whatsup brah" });

    const testAction = createFactory<ITestState>({
      actionName: "testAction",
      namespace: "testNS",
      reducer: reduce
    });

    const reducer = composeReducer(
      (state = initialTestState) => state,
      testAction.reducer
    );

    const action = testAction();

    expect(action).toHaveProperty("type");

    const store = createStore(reducer);
    store.dispatch(action);

    expect(testAction.type).toBe(`testNS/testAction`);
    expect(testAction.actionName).toBe("testAction");
    expect(testAction.namespace).toBe("testNS");
    expect(testAction.reducer(initialTestState, testAction())).toMatchObject(
      reduce(initialTestState)
    );
    expect(store.getState()).toMatchObject({
      hey: "whatsup brah"
    });
  });

  it("createAsyncFactory works", () => {
    const requestReducer = (state: ITestState, action?: Action<{}>) => ({
      ...state,
      hey: "whatsup brah"
    });
    const errorMessage = "Could not authenticate";
    const fulfillReducer = (
      state: ITestState,
      action?: Action<{ user: string }>
    ) => ({ ...state, data: action ? action.payload : null });
    const errorReducer = (state: ITestState, action?: Action<string>) => ({
      ...state,
      error: action ? action.payload : null
    });
    const actionName = "testAction";
    const namespace = "ns";
    const testAction = createAsyncFactory({
      actionName,
      errorReducer,
      fulfillReducer,
      namespace,
      requestReducer
    });
    const store = createStore(testAction.reducer);
    const request = testAction.request();
    const fulfill = testAction.fulfill();
    const error = testAction.error(errorMessage);

    expect(request).toHaveProperty("type");
    expect(fulfill).toHaveProperty("type");
    expect(error).toHaveProperty("type");

    expect(testAction.type).toBe(`${namespace}/${actionName}`);
    expect(testAction.actionName).toBe(actionName);
    expect(testAction.namespace).toBe(namespace);
    expect(testAction.reducer(initialTestState, request)).toMatchObject(
      testAction.requestReducer(initialTestState, request)
    );

    expect(testAction.reducer(initialTestState, fulfill)).toMatchObject(
      testAction.fulfillReducer(initialTestState, fulfill)
    );

    expect(testAction.reducer(initialTestState, error)).toMatchObject(
      testAction.errorReducer(initialTestState, error)
    );

    store.dispatch(request);
    expect(store.getState()).toMatchObject({
      hey: "whatsup brah"
    });

    store.dispatch(error);
    expect(store.getState()).toMatchObject({
      hey: "whatsup brah",
      error: errorMessage
    });

    store.dispatch(fulfill);
    expect(store.getState()).toMatchObject({
      hey: "whatsup brah",
      error: errorMessage,
      data: undefined
    });
  });
  it("should be able to merge async actions", () => {
    const authenticate = createAsyncFactory({
      errorReducer: (state, { payload }) => ({
        ...state,
        loading: false,
        error: payload
      }),
      fulfillReducer: (state, { payload }) => ({
        ...state,
        loading: false,
        data: payload
      }),
      actionName: "authenticate",
      namespace: "user",
      requestReducer: (state, { payload }: Action<{ test: string }>) => ({
        ...state,
        loading: true
      })
    });

    const test = authenticate.merge({
      actionName: "test",
      requestReducer: (state, { payload }) => ({
        ...state,
        test: payload ? payload.test : null
      })
    });

    expect(
      test.reducer(initialTestState, test({ test: "Hey" }))
    ).toMatchObject({ loading: true, test: "Hey" });
  });

  it("should be able to merge sync actions", () => {
    const namespace = "ns";
    const defaultState = {
      open: false,
      test: false
    };

    const toggleOpen = createFactory({
      namespace,
      actionName: "toggleOpen",
      reducer: (state: { open: boolean; test: boolean }) => ({
        ...state,
        open: !state.open
      })
    });

    const toggleOpen2 = toggleOpen.merge({
      actionName: "toggleOpen2"
    });

    const toggleOpenAndTest = toggleOpen.merge({
      actionName: "toggleOpenAndTest",
      reducer: state => ({ ...state, test: !state.test })
    });

    expect(toggleOpen2.reducer(defaultState, toggleOpen2())).toMatchObject({
      open: true
    });

    expect(
      toggleOpenAndTest.reducer(defaultState, toggleOpenAndTest())
    ).toMatchObject({
      test: true,
      open: true
    });
  });

  it("should be able to assign actions", () => {
    const namespace = "ns";
    const defaultState = {
      open: false,
      test: false
    };
    type State = typeof defaultState;
    const toggleOpen = createFactory<State>({
      namespace,
      actionName: "toggleOpen",
      reducer: state => ({
        ...state,
        open: !state.open
      })
    });

    const toggleTest = toggleOpen.assign({
      actionName: "toggleTest",
      reducer: state => ({
        ...state,
        test: !state.test
      })
    });

    expect(toggleOpen.reducer(defaultState, toggleOpen())).toMatchObject({
      test: false,
      open: true
    });

    expect(toggleTest.reducer(defaultState, toggleTest())).toMatchObject({
      test: true,
      open: false
    });
  });

  it("should be able to scope reducers", () => {
    const namespace = "myComponent";
    const defaultState = {
      message: "Welcome",
      right: {
        open: false
      },
      left: {
        open: false
      },
      table: {
        data: [],
        loading: false,
        error: null
      }
    };

    type OpenState = { open: boolean };

    const toggleOpenRight = createFactory<OpenState>({
      namespace,
      actionName: "toggleOpenRight",
      reducer: state => ({
        ...state,
        open: true
      })
    });

    const toggleOpenLeft = toggleOpenRight.merge({
      actionName: "toggleOpenLeft"
    });

    const getTableData = defaultAsync.merge({
      namespace,
      actionName: "getTableData"
    });

    expect(
      scopeReducers({
        table: getTableData.reducer
      })(defaultState, getTableData())
    ).toMatchObject({
      table: {
        loading: true
      }
    });

    expect(
      scopeReducers({
        table: getTableData.reducer
      })(defaultState, getTableData.fulfill(["test"]))
    ).toMatchObject({
      table: {
        loading: false,
        data: ["test"]
      }
    });

    expect(
      scopeReducers({
        table: getTableData.reducer
      })(defaultState, getTableData.error("this is an error message"))
    ).toMatchObject({
      table: {
        loading: false,
        error: "this is an error message"
      }
    });

    const reducer = composeReducer(
      (state = defaultState) => state,
      scopeReducers({
        right: toggleOpenRight.reducer
      })
    );

    expect(reducer(defaultState, toggleOpenRight())).toMatchObject({
      right: {
        open: true
      }
    });

    // Make sure if no action was caught, the same state is returned
    expect(reducer(defaultState, toggleOpenLeft())).toBe(defaultState);

    expect(
      scopeReducers({
        left: toggleOpenLeft.reducer
      })(defaultState, toggleOpenLeft())
    ).toMatchObject({
      left: {
        open: true
      }
    });
  });
});
