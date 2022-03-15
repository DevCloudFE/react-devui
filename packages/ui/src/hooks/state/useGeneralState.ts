import type { DGeneralState } from '../../types';

import React, { useContext } from 'react';

export const DGeneralStateContext = React.createContext<DGeneralState>({ gDisabled: false });

export function useGeneralState() {
  const generalState = useContext(DGeneralStateContext);

  return generalState;
}
