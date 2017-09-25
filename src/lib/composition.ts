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
export function composeReducer<State, A extends Action = Action>(
  ...reducers: Reducer<State>[]
): Reducer<State, A> {
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

export const scopeReducers = <S, A extends Action = Action>(
  reducerMap: { [K in keyof S]?: Reducer<S[K]> }
) =>
  composeReducer<S>(
    ...Object.entries(
      reducerMap
    ).map(([key, value]: [string, Reducer<S>]) => (_state: S, _action: A) => {
      const next = value(_state[key], _action);
      return next === _state[key]
        ? _state
        : Object.assign({}, _state, { [key]: next });
    })
  ) as Reducer<S>;
