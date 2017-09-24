import { Action, composeReducer, Reducer } from "./composition";

export interface IExtra<State, PayloadType> {
  reducer: (state: State, action: Action<PayloadType>) => State;
  actionName: string;
  namespace: string;
  type: string;
}

export interface IExtraAsync<S, R, F, E> {
  reducer: Reducer<S, Action<R | F | E>>;
  request: (payload?: R) => Action<R>;
  requestReducer: Reducer<S, Action<R>>;
  requestType: string;
  fulfillReducer: Reducer<S, Action<F>>;
  fulfill: (payload?: F) => Action<F>;
  errorReducer: Reducer<S, Action<E>>;
  error: (payload?: E) => Action<E>;
  actionName: string;
  namespace: string;
  type: string;
  fulfillType: string;
  errorType: string;
}

const assign = Object.assign;

export const createFactory = <State, PayloadType = {}>({
  namespace,
  actionName,
  reducer
}: {
  namespace: string;
  actionName: string;
  reducer: (state: State, action: Action<PayloadType>) => State;
}) => {
  const actionType = `${namespace}/${actionName}`;

  type IOutput = ((payload?: PayloadType) => Action<PayloadType>) &
    IExtra<State, PayloadType>;

  const creator: ((
    payload?: PayloadType
  ) => Action<PayloadType>) = payload => ({
    payload,
    type: `${namespace}/${actionName}`
  });

  const extra: IExtra<State, PayloadType> = {
    actionName,
    namespace,
    reducer: (state, action) => {
      if (action.type === actionType) {
        return reducer(state, action);
      } else {
        return state;
      }
    },
    type: actionType
  };

  const output: IOutput = assign(creator, extra);

  return output;
};

export const createAsyncFactory = <S, R, F, E>({
  namespace,
  actionName,
  requestReducer,
  fulfillReducer,
  errorReducer
}: {
  namespace: string;
  actionName: string;
  requestReducer: Reducer<S, Action<R>>;
  fulfillReducer: Reducer<S, Action<F>>;
  errorReducer: Reducer<S, Action<E>>;
}) => {
  const actionType = `${namespace}/${actionName}`;
  const actionTypes = {
    error: `${actionType}_ERROR`,
    fulfill: `${actionType}_FULFILL`,
    request: actionType
  };

  type Extra = IExtraAsync<S, R, F, E>;
  type IOutput = ((payload?: R) => Action<R, typeof actionTypes.request>) &
    Extra;

  const requestCreator: ((
    payload?: R
  ) => Action<R, typeof actionTypes.request>) = payload => ({
    payload,
    type: actionTypes.request
  });

  const fulfillCreator: ((
    payload?: F
  ) => Action<F, typeof actionTypes.fulfill>) = payload => ({
    payload,
    type: actionTypes.fulfill
  });

  const errorCreator: ((
    payload?: E
  ) => Action<E, typeof actionTypes.error>) = payload => ({
    payload,
    type: actionTypes.error
  });

  const _errorReducer: typeof errorReducer = (state, action) => {
    if (action.type === actionTypes.error) {
      return errorReducer(state, action);
    } else {
      return state;
    }
  };
  const _fulfillReducer: typeof fulfillReducer = (state, action) => {
    if (action.type === actionTypes.fulfill) {
      return fulfillReducer(state, action);
    } else {
      return state;
    }
  };
  const _requestReducer: typeof requestReducer = (state, action) => {
    if (action.type === actionTypes.request) {
      return requestReducer(state, action);
    } else {
      return state;
    }
  };

  const extra: Extra = {
    actionName,
    error: errorCreator,
    errorReducer: _errorReducer,
    errorType: actionTypes.error,
    fulfill: fulfillCreator,
    fulfillReducer: _fulfillReducer,
    fulfillType: actionTypes.fulfill,
    namespace,
    reducer: composeReducer(_requestReducer, _errorReducer, _fulfillReducer),
    request: requestCreator,
    requestReducer: _requestReducer,
    requestType: actionTypes.request,
    type: actionType
  };

  const output: IOutput = assign(requestCreator, extra);

  return output;
};
