import { isUndefined } from 'lodash';
import { useContext } from 'react';

import { DIconContext } from './Icon';

export function useIconProps<T extends object>(props: T): T {
  const context = useContext(DIconContext);
  const gProps = context.props ?? {};
  const noUndefinedProps: any = {};
  Object.keys(props).forEach((key) => {
    if (!isUndefined(props[key])) {
      noUndefinedProps[key] = props[key];
    }
  });

  return { ...gProps, ...noUndefinedProps };
}
