import { isUndefined } from 'lodash';
import React, { useContext } from 'react';

export const DComponentConfigContext = React.createContext({});
export const DPrefixConfigContext = React.createContext('d-');

export function useDComponentConfig<T>(component: string, props: T): T {
  const dConfig = useContext(DComponentConfigContext);
  const customConfig = dConfig[component] ?? {};
  const noUndefinedProps: unknown = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });
  return { ...customConfig, ...(noUndefinedProps as T) };
}

export function useDPrefixConfig() {
  const prefix = useContext(DPrefixConfigContext);
  return prefix;
}
