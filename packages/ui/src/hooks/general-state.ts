import React, { useContext } from 'react';

export interface DGeneralStateContextData {
  gSize?: 'smaller' | 'larger';
  gDisabled: boolean;
}
export const DGeneralStateContext = React.createContext<DGeneralStateContextData>({ gDisabled: false });

export function useGeneralState() {
  const generalState = useContext(DGeneralStateContext);

  return generalState;
}
