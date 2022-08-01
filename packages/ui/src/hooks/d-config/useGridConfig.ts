import type { DBreakpoints } from '../../components/grid';

import { useContext } from 'react';

import { DConfigContext } from './contex';

const BREAKPOINTS = new Map<DBreakpoints, number>([
  ['xs', 0],
  ['sm', 576],
  ['md', 768],
  ['lg', 992],
  ['xl', 1200],
  ['xxl', 1400],
]);
export function useGridConfig() {
  const grid = useContext(DConfigContext)?.grid;
  const breakpoints = grid?.breakpoints ?? BREAKPOINTS;
  const colNum = grid?.colNum ?? 12;

  return {
    dBreakpoints: breakpoints,
    dColNum: colNum,
  };
}
