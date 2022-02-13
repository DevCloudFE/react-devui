/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from 'react';

import { useEventCallback, useForceUpdate } from '../../hooks';

export function useTreeData<R>(
  select: any,
  getOptions: (select: any) => R,
  onSelectChange?: (value: any) => void
): [R, (value: any) => void] {
  const dataRef = useRef<any>(null);

  const forceUpdate = useForceUpdate();

  const options = useMemo(() => {
    if (dataRef.current) {
      const res = dataRef.current;
      dataRef.current = null;
      return res;
    } else {
      return getOptions(select);
    }
  }, [getOptions, select]);

  const changeSelect = useEventCallback((value: any) => {
    onSelectChange?.(value);

    dataRef.current = [].concat(options);
    forceUpdate();
  });

  return [options, changeSelect];
}
