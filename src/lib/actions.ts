import { IReAction } from "./composition";

export interface IExtra<State, PayloadType> {
  reducer: (state: State, action: IReAction<PayloadType>) => State;
  actionName: string;
  namespace: string;
  type: string;
}

const assign = Object.assign;
export const makeAction = <State, PayloadType = {}>({
  namespace,
  actionName,
  reduce
}: {
  namespace: string;
  actionName: string;
  reduce: (state: State, action: IReAction<PayloadType>) => State;
}) => {
  const actionType = `${namespace}/${actionName}`;

  type IOutput = ((payload?: PayloadType) => IReAction<PayloadType>) &
    IExtra<State, PayloadType>;

  const creator: ((
    payload?: PayloadType
  ) => IReAction<PayloadType>) = payload => ({
    payload,
    type: `${namespace}/${actionName}`
  });

  const extra: IExtra<State, PayloadType> = {
    actionName,
    namespace,
    reducer: (state, action) => {
      if (action.type === actionType) {
        return reduce(state, action);
      } else {
        return state;
      }
    },
    type: actionType
  };

  const output: IOutput = assign(creator, extra);

  return output;
};
