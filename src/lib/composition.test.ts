import { createStore } from "redux";
import {
  composeReducer,
  ReReducer,
  ReAction,
  initialStateReducer
} from "./composition";

interface State {
  test: string;
  hey: string;
}

const initialState = {
  test: "wadup",
  hey: "man"
};

describe("Redux composition helpers", () => {
  it("Should be able to compose reducers", () => {
    const reducers: ReReducer<State>[] = [(s = initialState, a) => s];

    const mainReducer = (state: State, action: ReAction) =>
      composeReducer(...reducers)(state, action);

    const store = createStore(mainReducer);

    store.dispatch({
      type: "whatever"
    });

    expect(store.getState()).toBe(initialState);

    reducers.push(
      (state, action) =>
        action.type == "whatever"
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
