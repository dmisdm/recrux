import { createStore } from "redux";

import { createAsyncFactory, createFactory } from "./actions";
import { Action, composeReducer } from "./composition";
import { initialTestState, ITestState } from "./TestModels";

describe("Action creators", () => {
  it("createFactory works", () => {
    const reduce = (state: ITestState) => ({ ...state, hey: "whatsup brah" });

    const testAction = createFactory<ITestState>({
      name: "testAction",
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
    expect(testAction.name).toBe("testAction");
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
      name,
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
    expect(testAction.name).toBe(actionName);
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
  /*   it("should be able to compose actions", () => {
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
      name: "authenticate",
      namespace: "user",
      requestReducer: (state, { payload }) => ({ ...state, loading: true })
    });
  }); */
});
