import { Action } from "redux";

export interface ReAction<T = string, P = {}> extends Action {
  type: T;
  payload?: P;
}

export interface ReReducer<State, Action extends ReAction = ReAction> {
  (state: State, action: Action): State;
}
/**
 * Create one reducer that is a composition of many. Behaves like a waterfall starting from the first argument
 * @param reducers 
 */
export function composeReducer<State>(
  ...reducers: ReReducer<State>[]
): ReReducer<State> {
  return (state: State, action: Action) =>
    reducers.reduce((state, reducer) => reducer(state, action), state);
}

export const initialStateReducer = <State>(initialState: State) => {
  return (state = initialState) => state;
};
