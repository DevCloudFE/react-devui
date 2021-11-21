/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEqual, isUndefined } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';

export function useManualOrAutoState(
  defaultState: boolean,
  manualState?: boolean,
  onStateChange?: (state: boolean) => void
): [boolean, (value?: boolean, reverse?: true) => void];
export function useManualOrAutoState<T>(defaultState: T, manualState?: T, onStateChange?: (state: T) => void): [T, (value: T) => void];
export function useManualOrAutoState(defaultState: any, manualState: any, onStateChange?: (state: any) => void) {
  const [autoState, setAutoState] = useImmer(() => (isUndefined(manualState) ? defaultState : manualState));

  const state = useMemo(() => (isUndefined(manualState) ? autoState : manualState), [manualState, autoState]);

  const setState = useCallback(
    (value, reverse) => {
      let newState: any;
      if (reverse === true) {
        newState = !state;
      } else {
        newState = value;
      }
      if (!isEqual(newState, autoState)) {
        setAutoState(newState);
        onStateChange?.(newState);
      }
    },
    [autoState, onStateChange, setAutoState, state]
  );

  return [state, setState] as const;
}
