import type { DComponentConfig } from './contex';

import { isUndefined } from 'lodash';
import { useContext } from 'react';

import { DConfigContext } from './contex';

export function useComponentConfig<T>(component: keyof DComponentConfig, props: T): T {
  const componentConfigs = useContext(DConfigContext).componentConfigs ?? {};
  const customConfig = componentConfigs[component] ?? {};
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      (noUndefinedProps as T)[key] = props[key];
    }
  });

  return { ...customConfig, ...(noUndefinedProps as T) };
}
