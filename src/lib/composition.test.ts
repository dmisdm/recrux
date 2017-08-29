import { createStore } from "redux";
import {
  composeReducer,
  fromMap,
  IActionMap,
  initialStateReducer,
  IReAction,
  ReReducer
} from "./composition";
import { initialTestState, ITestState } from "./TestModels";

describe("Redux composition helpers", () => {
  it("Should be able to compose reducers", () => {
    const reducers: Array<ReReducer<ITestState>> = [
      (s = initialTestState, a) => s
    ];

    const mainReducer = (state: ITestState, action: IReAction) =>
      composeReducer(...reducers)(state, action);

    const store = createStore(mainReducer);

    store.dispatch({
      type: "whatever"
    });

    expect(store.getState()).toBe(initialTestState);

    reducers.push(
      (state, action) =>
        action.type === "whatever"
          ? {
              ...state,
              hey: "whatever"
            }
          : state
    );

    store.dispatch({
      type: "whatever"
    });

    expect(store.getState().hey).toBe("whatever");
  });

  it("initialStateReducer should work", () => {
    const reducer = composeReducer(
      initialStateReducer({
        yay: "yayee"
      })
    );

    const store = createStore(reducer);
    const currentState = store.getState();

    expect(currentState && currentState.yay).toBe("yayee");
  });

  it("fromMap should work", () => {
    const actionMap: IActionMap<ITestState> = {
      "test/test": (state, action) => ({ ...state, test: "yeah" })
    };
    const reducer = fromMap(actionMap);
    expect(reducer(initialTestState, { type: "test/test" })).toMatchObject({
      test: "yeah"
    });
  });
});
