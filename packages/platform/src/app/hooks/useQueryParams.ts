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
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queryValues = useMemo<T>(() => (searchParams.get(KEY) ? JSURL.parse(searchParams.get(KEY)) : initParams), [searchParams]);

  const setQueryValues = useEventCallback((newValue: T | ((draft: T) => void), options?: NavigateOptions) => {
    const newQueryValues = isFunction(newValue) ? produce(queryValues, newValue) : newValue;
    setSearchParams(
      (prev) => {
        prev.set(KEY, JSURL.stringify(newQueryValues));
        return prev;
      },
      { replace: true, ...options }
    );
  });
  return [queryValues, setQueryValues];
}
