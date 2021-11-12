/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUndefined } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';

export function useManualOrAutoState(
  defaultState: boolean,
  manualState?: boolean,
  onStateChange?: (state: boolean) => void
): [boolean, React.Dispatch<{ reverse?: boolean; value?: boolean }>];
export function useManualOrAutoState<T>(
  defaultState: T,
  manualState?: T,
  onStateChange?: (state: T) => void
): [T, React.Dispatch<{ value: T }>];
export function useManualOrAutoState(defaultState: any, manualState: any, onStateChange?: (state: any) => void) {
  const [state, dispatch] = useImmerReducer<any, { reverse?: boolean; value: any }>(
    (draft, action) => {
      if (action.reverse) {
        return !draft;
      } else {
        return action.value;
      }
    },
    isUndefined(manualState) ? defaultState : manualState
  );

  const currentState = useMemo(() => (isUndefined(manualState) ? state : manualState), [manualState, state]);

  useEffect(() => {
    if (!isUndefined(manualState) && currentState !== state) {
      onStateChange?.(state);
    }
  }, [manualState, state, currentState, onStateChange]);

  return [currentState, dispatch] as const;
}
