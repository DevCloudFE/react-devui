/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUndefined } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { useImmerReducer } from './immer';

export function useManualOrAutoState(
  defaultState: boolean,
  manualState?: boolean,
  onStateChange?: (state: boolean) => void
): [boolean, React.Dispatch<{ reverse?: true; value?: boolean }>];
export function useManualOrAutoState<T, R>(
  defaultState: T | (() => T),
  manualState?: T,
  onStateChange?: (state: R) => void
): [T, React.Dispatch<{ value: R }>];
export function useManualOrAutoState(defaultState: any, manualState: any, onStateChange?: (state: any) => void) {
  const [initState] = useState(defaultState);
  const [autoState, dispatchAutoState] = useImmerReducer<any, { value: any; reverse?: true }>(
    (draft, action) => {
      if (action.reverse) {
        return isUndefined(manualState) ? !draft : !manualState;
      } else {
        return action.value;
      }
    },
    isUndefined(manualState) ? initState : manualState
  );

  const state = useMemo(() => (isUndefined(manualState) ? autoState : manualState), [manualState, autoState]);

  useEffect(() => {
    onStateChange?.(autoState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoState]);

  return [state, dispatchAutoState] as const;
}
