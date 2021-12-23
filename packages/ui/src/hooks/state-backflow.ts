/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useContext, useEffect, useId, useRef } from 'react';

export interface DStateBackflowContextData {
  addState: (identity: string, ...state: any[]) => void;
  updateState: (identity: string, ...state: any[]) => void;
  removeState: (identity: string) => void;
}
export const DStateBackflowContext = React.createContext<DStateBackflowContextData>({
  addState: () => {},
  updateState: () => {},
  removeState: () => {},
});

export function useStateBackflow(...state: any[]) {
  const stateBackflow = useContext(DStateBackflowContext);

  const identity = useId();

  const dataRef = useRef<{ preState: any[] | null }>({
    preState: null,
  });

  useEffect(() => {
    if (dataRef.current.preState === null) {
      dataRef.current.preState = state;
    }
    for (const [index, s] of state.entries()) {
      if (!Object.is(s, dataRef.current.preState[index])) {
        stateBackflow.updateState(identity, ...state);
        dataRef.current.preState = state;
      }
    }
  });

  useEffect(() => {
    stateBackflow.addState(identity, ...state);
    return () => {
      stateBackflow.removeState(identity);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return identity;
}
