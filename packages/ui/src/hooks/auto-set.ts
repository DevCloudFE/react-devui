/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Updater } from 'use-immer';

import { isUndefined } from 'lodash';
import { useCallback, useEffect } from 'react';
import { useImmer } from 'use-immer';

export function useAutoSet<T>(defaultState: T, manualState: T | undefined, onStateChange?: (state: T) => void): [T, Updater<T>];
export function useAutoSet<T>(
  defaultState: T | undefined,
  manualState: T | undefined,
  onStateChange?: (state: T) => void
): [T | null, Updater<T>];
export function useAutoSet(defaultState: any, manualState: any, onStateChange?: (state: any) => void) {
  const [val, setVal] = useImmer(isUndefined(manualState) ? defaultState : manualState);

  useEffect(() => {
    if (!isUndefined(manualState)) {
      setVal(manualState);
    }
  }, [manualState, setVal]);

  const setState = useCallback(
    (state) => {
      if (isUndefined(manualState)) {
        setVal(state);
      } else {
        onStateChange?.(state);
      }
    },
    [manualState, onStateChange, setVal]
  );

  return [val ?? null, setState] as const;
}
