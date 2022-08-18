import { isArray, isNumber } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { useAsync, useForceUpdate, useIsomorphicLayoutEffect } from '@react-devui/hooks';

export type DTransitionState = 'before-enter' | 'enter' | 'entering' | 'entered' | 'before-leave' | 'leave' | 'leaving' | 'leaved';
const [T_BEFORE_ENTER, T_ENTER, T_ENTERING, T_ENTERED, T_BEFORE_LEAVE, T_LEAVE, T_LEAVING, T_LEAVED] = [
  'before-enter',
  'enter',
  'entering',
  'entered',
  'before-leave',
  'leave',
  'leaving',
  'leaved',
] as DTransitionState[];

export interface DTransitionProps {
  children: (state: DTransitionState) => JSX.Element | null;
  dIn?: boolean;
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
    dIn = false,
    dDuring,
    dMountBeforeFirstEnter = true,
    dSkipFirstTransition = true,
    onEnterRendered,
    afterEnter,
    afterLeave,
  } = props;

  const initState = useMemo(() => {
    const [skipEnter, skipLeave] = isArray(dSkipFirstTransition) ? dSkipFirstTransition : [dSkipFirstTransition, dSkipFirstTransition];
    if (dIn) {
      return skipEnter ? T_ENTERED : T_BEFORE_ENTER;
    } else {
      return skipLeave ? T_LEAVED : T_BEFORE_LEAVE;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    dataRef.current.state = dIn ? T_BEFORE_ENTER : T_BEFORE_LEAVE;
    dataRef.current.isFirstEnter = false;
  }

  const state = dataRef.current.state;
  const startTransition = state === T_ENTER || state === T_LEAVE;

  useIsomorphicLayoutEffect(() => {
    if (state === T_ENTERED) {
      onEnterRendered?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (state === T_BEFORE_ENTER) {
      onEnterRendered?.();
      updateTransitionState(T_ENTER);
    } else if (state === T_BEFORE_LEAVE) {
      updateTransitionState(T_LEAVE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dIn]);

  useEffect(() => {
    if (startTransition) {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.requestAnimationFrame(() => {
        const isEnter = state === T_ENTER;
        const nextState = isEnter ? T_ENTERING : T_LEAVING;
        updateTransitionState(nextState);

        const isEntering = nextState === T_ENTERING;
        const endState = isEntering ? T_ENTERED : T_LEAVED;
        const during = isNumber(dDuring) ? dDuring : isEntering ? dDuring.enter : dDuring.leave;
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          updateTransitionState(endState);
          endState === T_ENTERED ? afterEnter?.() : afterLeave?.();
        }, during);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransition]);

  const shouldRender = (() => {
    if (dataRef.current.isFirstEnter && !dMountBeforeFirstEnter) {
      return false;
    }

    return true;
  })();

  return shouldRender ? children(state) : null;
}
