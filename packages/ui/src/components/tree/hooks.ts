import { useMemo, useRef } from 'react';

import { useEventCallback, useForceUpdate, useIsomorphicLayoutEffect } from '../../hooks';

export function useTreeData<R>(
  select: any,
  getOptions: (select: any) => R,
  onSelectChange?: (value: any) => void
): [R, (value: any) => void] {
  const prevOptions = useRef<any>();

  const forceUpdate = useForceUpdate();

  const options = useMemo(() => {
    if (prevOptions.current) {
      return prevOptions.current;
    } else {
      return getOptions(select);
    }
  }, [getOptions, select]);

  const changeSelect = useEventCallback((value: any) => {
    onSelectChange?.(value);

    prevOptions.current = [].concat(options);
    forceUpdate();
  });

  useIsomorphicLayoutEffect(() => {
    prevOptions.current = null;
  });

  return [options, changeSelect];
}
