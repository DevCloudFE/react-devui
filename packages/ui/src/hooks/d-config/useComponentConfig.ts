import type { DComponentConfig } from './contex';

import { isUndefined } from 'lodash';
import { useContext } from 'react';

import { DConfigContext } from './contex';

export function useComponentConfig<T extends object>(component: keyof DComponentConfig, props: T): T {
  const gProps = useContext(DConfigContext)?.componentConfigs?.[component] ?? {};
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      noUndefinedProps[key] = props[key];
    }
  });

  return { ...gProps, ...noUndefinedProps };
}
