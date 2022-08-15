import { useContext } from 'react';

import { DConfigContext } from './contex';

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext)?.prefix ?? 'd-';
  return prefix;
}
