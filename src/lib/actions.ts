import { Action, composeReducer, Reducer } from "./composition";
import { Optional } from "./types";
import { identity } from "./utils";

/* const actionRegistry = {};
const doesActionExist = (actionName: string) => !!actionRegistry[actionName];
const registerAction = (actionName: string) =>
  (actionRegistry[actionName] = true); */

export type Creator<R> = (payload?: R) => Action<R>;

export interface SyncFactoryParams<S, P> {
  namespace: string;
  actionName: string;
  reducer: (state: S, action: Action<P>) => S;
}

export interface AsyncFactoryParam<S, R, F, E> {
  namespace: string;
  actionName: string;
  requestReducer: Reducer<S, Action<R>>;
  fulfillReducer: Reducer<S, Action<F>>;
  errorReducer: Reducer<S, Action<E>>;
}

export interface SyncFactory<S, P> {
  reducer: (state: S, action: Action<P>) => S;
  actionName: string;
  namespace: string;
  type: string;
  merge: (
    param: Optional<SyncFactoryParams<S, P>> & { actionName: string }
  ) => SyncFactoryOut<S, P>;
  assign: (
    param: Optional<SyncFactoryParams<S, P>> & { actionName: string }
  ) => SyncFactoryOut<S, P>;
}

export type SyncFactoryOut<S, P> = SyncFactory<S, P> & Creator<P>;

export interface AsyncFactory<S, R, F, E> {
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
  merge: (
    paramOpt: Optional<AsyncFactoryParam<S, R, F, E>> & { actionName: string }
  ) => AsyncFactoryOut<S, R, F, E>;
  assign: (
    paramOpt: Optional<AsyncFactoryParam<S, R, F, E>> & { actionName: string }
  ) => AsyncFactoryOut<S, R, F, E>;
}

export type AsyncFactoryOut<S, R, F, E> = AsyncFactory<S, R, F, E> & Creator<R>;

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

  const creator: ((
    payload?: PayloadType
  ) => Action<PayloadType>) = payload => ({
    payload,
    type: `${namespace}/${actionName}`
  });

  const _reducer: typeof reducer = (state, action) => {
    if (action.type === actionType) {
      return reducer(state, action);
    } else {
      return state;
    }
  };

  const extra: SyncFactory<State, PayloadType> = {
    actionName,
    merge: param =>
      createFactory({
        namespace,
        ...param,
        reducer: composeReducer(
          reducer,
          param.reducer ? param.reducer : identity
        )
      }),
    assign: param =>
      createFactory({
        ...{ namespace, reducer },
        ...param
      }),
    namespace,
    reducer: _reducer,
    type: actionType
  };

  const output: SyncFactoryOut<State, PayloadType> = assign(creator, extra);

  return output;
};

export const createAsyncFactory = <S, R, F, E>({
  namespace,
  actionName,
  requestReducer,
  fulfillReducer,
  errorReducer
}: AsyncFactoryParam<S, R, F, E>) => {
  const actionType = `${namespace}/${actionName}`;
  const actionTypes = {
    error: `${actionType}_ERROR`,
    fulfill: `${actionType}_FULFILL`,
    request: actionType
  };

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

  const extra: AsyncFactory<S, R, F, E> = {
    actionName,
    error: errorCreator,
    errorReducer: _errorReducer,
    errorType: actionTypes.error,
    merge: param =>
      createAsyncFactory({
        namespace,
        ...param,
        requestReducer: composeReducer(
          param.requestReducer ? param.requestReducer : identity,
          requestReducer
        ),
        errorReducer: composeReducer(
          param.errorReducer ? param.errorReducer : identity,
          errorReducer
        ),
        fulfillReducer: composeReducer(
          param.fulfillReducer ? param.fulfillReducer : identity,
          fulfillReducer
        )
      }),
    assign: param =>
      createAsyncFactory({
        ...{ namespace, requestReducer, errorReducer, fulfillReducer },
        ...param
      }),
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

  const output: AsyncFactoryOut<S, R, F, E> = assign(requestCreator, extra);
  return output;
};
