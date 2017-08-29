import { createStore } from "redux";
import { makeAction } from "./actions";
import { composeReducer } from "./composition";
import { initialTestState, ITestState } from "./TestModels";

describe("Action creators", () => {
  it("makeAction returns what it should return", () => {
    const reduce = (state: ITestState) => ({ ...state, hey: "whatsup brah" });

    const testAction = makeAction<ITestState>({
      actionName: "testAction",
      namespace: "testNS",
      reduce
    });

    const reducer = composeReducer(
      (state = initialTestState) => state,
      testAction.reducer
    );

    const store = createStore(reducer);
    store.dispatch(testAction());

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
});
