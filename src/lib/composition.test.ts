import { createStore } from "redux";
import {
  composeReducer,
  initialStateReducer,
  ReAction,
  ReReducer
} from "./composition";

interface State {
  test: string;
  hey: string;
}

const initialState = {
  hey: "man",
  test: "wadup"
};

describe("Redux composition helpers", () => {
  it("Should be able to compose reducers", () => {
    const reducers: Array<ReReducer<State>> = [(s = initialState, a) => s];

    const mainReducer = (state: State, action: ReAction) =>
      composeReducer(...reducers)(state, action);

    const store = createStore(mainReducer);

    store.dispatch({
      type: "whatever"
    });

    expect(store.getState()).toBe(initialState);

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
});
