import type { NavigateOptions } from 'react-router-dom';

import produce from 'immer';
import { isFunction } from 'lodash';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useEventCallback } from '@react-devui/hooks';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSURL = require('jsurl');

const KEY = 'query';

// eslint-disable-next-line @typescript-eslint/ban-types
export function useQueryParams<T extends {}>(
  initParams: Partial<T>
): [T, (newQuery: T | ((draft: T) => void), options?: NavigateOptions) => void] {
  const initURLSearchParams = useMemo(
    () => new URLSearchParams({ [KEY]: JSURL.stringify(initParams) }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [searchParams, setSearchParams] = useSearchParams(initURLSearchParams);
  const queryValues = useMemo<T>(() => JSURL.parse(searchParams.get(KEY)), [searchParams]);

  const setQueryValues = useEventCallback((newValue: T | ((draft: T) => void), options?: NavigateOptions) => {
    const newQueryValues = isFunction(newValue) ? produce(queryValues, newValue) : newValue;
    setSearchParams(new URLSearchParams({ [KEY]: JSURL.stringify(newQueryValues) }), { replace: true, ...options });
  });
  return [queryValues, setQueryValues];
}
