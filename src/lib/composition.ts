import { Action } from "redux";

export interface IReAction<P = {}> extends Action {
  payload?: P;
  type: string;
}

export type ReReducer<State, IAction extends IReAction = IReAction> = (
  state: State,
  action: IAction
) => State;
/**
 * Create one reducer that is a composition of many. Behaves like a waterfall starting from the first argument
 * @param reducers 
 */
export function composeReducer<State>(
  ...reducers: Array<ReReducer<State>>
): ReReducer<State> {
  return (state: State, action: Action) =>
    reducers.reduce((_state, reducer) => reducer(_state, action), state);
}

export const initialStateReducer = <State>(initialState: State) => {
  return (_state = initialState) => _state;
};

export interface IActionMap<State> {
  [key: string]: ReReducer<State>;
}
export const fromMap = <State>(map: IActionMap<State>) =>
  ((state, action) =>
    map[action.type] ? map[action.type](state, action) : state) as ReReducer<
    State
  >;
