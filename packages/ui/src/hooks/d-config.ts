import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

import { useRefSelector } from './element-ref';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DConfigContext = React.createContext<{ components?: { [index: string]: any }; prefix?: string; content?: string }>({});

export function useDPrefixConfig() {
  const prefix = useContext(DConfigContext).prefix ?? 'd-';
  return prefix;
}

export function useDContentConfig() {
  const content = useContext(DConfigContext).content ?? null;
  const contentRef = useRefSelector(content);

  return contentRef;
}

export function useDComponentConfig<T>(component: string, props: T): T {
  const components = useContext(DConfigContext).components ?? {};
  const customConfig = components[component] ?? {};
  const noUndefinedProps: unknown = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });
  return { ...customConfig, ...(noUndefinedProps as T) };
}
