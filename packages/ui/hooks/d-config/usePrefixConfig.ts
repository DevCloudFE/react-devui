import { useContext } from 'react';

import { DConfigContext } from './contex';

export function usePrefixConfig() {
  const prefix = `${useContext(DConfigContext)?.namespace ?? 'd'}-`;
  return prefix;
}
