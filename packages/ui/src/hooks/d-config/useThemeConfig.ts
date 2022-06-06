import { useContext } from 'react';

import { DConfigContext } from './contex';

export function useThemeConfig() {
  const theme = useContext(DConfigContext)?.theme ?? 'light';
  return theme;
}
