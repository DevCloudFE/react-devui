import { isArray, isNumber } from 'lodash';
import { useEffect, useRef, useState } from 'react';

import { useAsync, useForceUpdate, useMount } from '../..//hooks';

export type DTransitionState = 'enter' | 'entering' | 'entered' | 'leave' | 'leaving' | 'leaved';
const [T_ENTER, T_ENTERING, T_ENTERED, T_LEAVE, T_LEAVING, T_LEAVED] = [
  'enter',
  'entering',
  'entered',
  'leave',
  'leaving',
  'leaved',
] as DTransitionState[];

export interface DTransitionProps {
  children: (state: DTransitionState) => JSX.Element | null;
  dIn: boolean;
  dDuring: number | { enter: number; leave: number };
  dMountBeforeFirstEnter?: boolean;
  dSkipFirstTransition?: boolean | [boolean, boolean];
  onEnterRendered?: () => void;
  afterEnter?: () => void;
  afterLeave?: () => void;
}

export function DTransition(props: DTransitionProps): JSX.Element | null {
  const {
    children,
    dIn,
    dDuring,
    dMountBeforeFirstEnter = true,
    dSkipFirstTransition = true,
    onEnterRendered,
    afterEnter,
    afterLeave,
  } = props;

  const [initState] = useState(() => {
    const [skipEnter, skipLeave] = isArray(dSkipFirstTransition) ? dSkipFirstTransition : [dSkipFirstTransition, dSkipFirstTransition];
    if (dIn) {
      return skipEnter ? T_ENTERED : T_ENTER;
    } else {
      return skipLeave ? T_LEAVED : T_LEAVE;
    }
  });
  const dataRef = useRef<{
    prevIn: boolean;
    state: DTransitionState;
    isFirstEnter: boolean;
    clearTid?: () => void;
  }>({
    prevIn: dIn,
    state: initState,
    isFirstEnter: !dIn,
  });

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const updateTransitionState = (state: DTransitionState) => {
    dataRef.current.state = state;
    forceUpdate();
  };

  if (dataRef.current.prevIn !== dIn) {
    dataRef.current.prevIn = dIn;
    dataRef.current.state = dIn ? T_ENTER : T_LEAVE;
    dataRef.current.isFirstEnter = false;
  }

  useMount(() => {
    const state = dataRef.current.state;
    if (state === T_ENTERED) {
      onEnterRendered?.();
    }
  });

  useEffect(() => {
    dataRef.current.clearTid?.();

    const state = dataRef.current.state;
    if (state === T_ENTER || state === T_LEAVE) {
      if (state === T_ENTER) {
        onEnterRendered?.();
      }

      dataRef.current.clearTid = asyncCapture.afterNextAnimationFrame(() => {
        updateTransitionState(state === T_ENTER ? T_ENTERING : T_LEAVING);

        const endState = state === T_ENTER ? T_ENTERED : T_LEAVED;
        const during = isNumber(dDuring) ? dDuring : state === T_ENTER ? dDuring.enter : dDuring.leave;
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          updateTransitionState(endState);
          endState === T_ENTERED ? afterEnter?.() : afterLeave?.();
        }, during);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dIn]);

  const shouldRender = (() => {
    if (dataRef.current.isFirstEnter && !dMountBeforeFirstEnter) {
      return false;
    }

    return true;
  })();

  return shouldRender ? children(dataRef.current.state) : null;
}
