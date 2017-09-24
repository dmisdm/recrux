import { Action as ReduxAction } from "redux";

export interface Action<P = {}, T = string> extends ReduxAction {
  payload?: P;
  type: T;
}

export type Reducer<State, IAction extends Action = Action> = (
  state: State,
  action: IAction
) => State;
/**
 * Create one reducer that is a composition of many. Behaves like a waterfall starting from the first argument
 * @param reducers 
 */
export function composeReducer<State>(
  ...reducers: Array<Reducer<State>>
): Reducer<State> {
  return (state: State, action: Action) =>
    reducers.reduce((_state, reducer) => reducer(_state, action), state);
}

export const initialStateReducer = <State>(initialState: State) => {
  return (_state = initialState) => _state;
};

export interface IActionMap<State> {
  [actionType: string]: Reducer<State>;
}
/**
 * Make a reducer out of a map: {[actionType string]: Reducer }
 * @param map 
 */
export const fromMap = <State>(map: IActionMap<State>) =>
  ((state, action) =>
    map[action.type] ? map[action.type](state, action) : state) as Reducer<
    State
  >;
