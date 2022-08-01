import { useContext } from 'react';

import { DConfigContext } from './contex';

export function useLayout() {
  const { scrollEl = () => document.documentElement, resizeEl = () => null } = useContext(DConfigContext)?.layout ?? {};
  return { dScrollEl: scrollEl, dResizeEl: resizeEl };
}
