/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../../hooks';

export function useTreeData<R>(
  select: any,
  getOptions: (select: any) => R,
  onSelectChange?: (value: any) => void
): [R, (value: any) => void] {
  const dataRef = useRef<{
    select: any;
    options: any;
    getOptions: (select: any) => R;
  }>({
    select,
    options: null,
    getOptions,
  });

  const [options, setOptions] = useState<any>(() => getOptions(select));

  if (dataRef.current.options === null) {
    dataRef.current.options = options;
  }

  const changeSelect = useCallback(
    (value: any) => {
      dataRef.current.select = value;
      setOptions([].concat(dataRef.current.options));

      onSelectChange?.(value);
    },
    [onSelectChange]
  );

  useIsomorphicLayoutEffect(() => {
    if (select !== dataRef.current.select || getOptions !== dataRef.current.getOptions) {
      dataRef.current.select = select;
      dataRef.current.getOptions = getOptions;
      dataRef.current.options = getOptions(select);
      setOptions([].concat(dataRef.current.options));
    }
  }, [getOptions, select]);

  const res = useMemo<[any, (value: any) => void]>(() => [options, changeSelect], [changeSelect, options]);

  return res;
}
