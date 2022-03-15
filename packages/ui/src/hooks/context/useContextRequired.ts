import { isNull, isUndefined } from 'lodash';
import { useContext } from 'react';

export function useContextRequired<T>(Context: React.Context<T>): NonNullable<T> {
  const context = useContext<any>(Context);

  if (isNull(context) || isUndefined(context)) {
    throw new Error('Context is required!');
  }

  return context;
}
