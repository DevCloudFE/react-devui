import type { DIconContextData } from './Icon';

import { isNull, isUndefined } from 'lodash';
import { useContext } from 'react';

import { DIconContext } from './Icon';

export function useIconContext(): DIconContextData {
  const context = useContext(DIconContext);
  if (isNull(context)) {
    throw new Error('Please provide `DIconContext`!');
  }

  return context;
}

export function useIconProps<T extends object>(props: T): T {
  const context = useIconContext();

  const gProps = context.props ?? {};
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      noUndefinedProps[key] = props[key];
    }
  });

  return { ...gProps, ...noUndefinedProps };
}
