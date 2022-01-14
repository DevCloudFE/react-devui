import type { DBreakpoints } from '../components/grid';

import { isUndefined } from 'lodash';
import React, { useContext, useMemo } from 'react';

import { getFragmentChildren } from '../utils';
import { useRefSelector } from './element-ref';

interface Resources {
  [index: string]: string | Resources;
}

export type DTheme = 'light' | 'dark';
export type DLang = 'en-US' | 'zh-Hant';
export interface DConfigContextData {
  prefix?: string;
  theme?: DTheme;
  grid?: {
    breakpoints?: Map<DBreakpoints, number>;
    colNum?: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentConfigs?: { [index: string]: any };
  i18n?: {
    lang?: DLang;
    resources?: Resources;
  };
  icons?: Array<{
    name: string;
    list: Array<{
      viewBox: string;
      paths: string[];
      type?: string;
    }>;
  }>;
  contentSelector?: string;
}
export const DConfigContext = React.createContext<DConfigContextData>({});

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

const BREAKPOINTS = new Map<DBreakpoints, number>([
  ['xs', 0],
  ['sm', 576],
  ['md', 768],
  ['lg', 992],
  ['xl', 1200],
  ['xxl', 1400],
]);
export function useGridConfig() {
  const grid = useContext(DConfigContext).grid;
  const breakpoints = grid?.breakpoints ?? BREAKPOINTS;
  const colNum = grid?.colNum ?? 12;

  const res = useMemo(
    () => ({
      breakpoints,
      colNum,
    }),
    [breakpoints, colNum]
  );

  return res;
}

export function useThemeConfig() {
  const theme = useContext(DConfigContext).theme ?? 'light';
  return theme;
}

export function useComponentConfig<T>(component: string, props: T): T {
  const componentConfigs = useContext(DConfigContext).componentConfigs ?? {};
  const customConfig = componentConfigs[component] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });

  let children: React.ReactNode = undefined;
  if ('children' in noUndefinedProps) {
    children = getFragmentChildren(noUndefinedProps.children);
  } else if ('children' in customConfig) {
    children = getFragmentChildren(customConfig.children);
  }

  return { ...customConfig, ...(noUndefinedProps as T), children };
}

export function useContentRefConfig() {
  const contentSelector = useContext(DConfigContext).contentSelector ?? null;
  const contentRef = useRefSelector(contentSelector);

  return contentRef;
}
