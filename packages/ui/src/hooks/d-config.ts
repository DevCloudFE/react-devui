import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

import { getFragmentChildren } from '../utils';
import { useRefSelector } from './element-ref';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DConfigContext = React.createContext<{ components?: { [index: string]: any }; prefix?: string; content?: string }>({});

export function usePrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

export function useRootContentConfig() {
  const content = useContext(DConfigContext).content ?? null;
  const contentRef = useRefSelector(content);

  return contentRef;
}

export function useComponentConfig<T>(component: string, props: T): T {
  const components = useContext(DConfigContext).components ?? {};
  const customConfig = components[component] ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });

  let children: React.ReactNode = undefined;
  if ('children' in customConfig) {
    children = getFragmentChildren(customConfig.children);
  }
  if ('children' in noUndefinedProps) {
    children = getFragmentChildren(noUndefinedProps.children);
  }
  return { ...customConfig, ...(noUndefinedProps as T), children };
}
