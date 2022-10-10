import { isArray, isNumber } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAsync, useForceUpdate } from '@react-devui/hooks';

export type DTransitionState = 'enter' | 'entering' | 'entered' | 'leave' | 'leaving' | 'leaved';

export interface DTransitionProps {
  children: (state: DTransitionState) => JSX.Element | null;
  dIn: boolean;
  dDuring: number | { enter: number; leave: number };
  dMountBeforeFirstEnter?: boolean;
  dSkipFirstTransition?: boolean | [boolean, boolean];
  onEnter?: () => void;
  afterEnter?: () => void;
  afterLeave?: () => void;
}

export function DTransition(props: DTransitionProps): JSX.Element | null {
  const { children, dIn, dDuring, dMountBeforeFirstEnter = true, dSkipFirstTransition = true, onEnter, afterEnter, afterLeave } = props;

  const initState = useMemo<DTransitionState>(() => {
    const [skipEnter, skipLeave] = isArray(dSkipFirstTransition) ? dSkipFirstTransition : [dSkipFirstTransition, dSkipFirstTransition];
    if (dIn) {
      return skipEnter ? 'entered' : 'enter';
    } else {
      return skipLeave ? 'leaved' : 'leave';
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

  const async = useAsync();
  const forceUpdate = useForceUpdate();

  const [startTransition, setStartTransition] = useState(0);

  if (dataRef.current.prevIn !== dIn) {
    dataRef.current.prevIn = dIn;
    dataRef.current.state = dIn ? 'enter' : 'leave';
    dataRef.current.isFirstEnter = false;
  }

  const state = dataRef.current.state;

  const nextFrame = (cb: () => void) => {
    dataRef.current.clearTid = async.requestAnimationFrame(() => {
      dataRef.current.clearTid = async.setTimeout(cb);
    });
  };

  useEffect(() => {
    if (state === 'entered') {
      onEnter?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dataRef.current.clearTid?.();
    if (state === 'enter') {
      onEnter?.();
      nextFrame(() => {
        dataRef.current.state = 'entering';
        setStartTransition((draft) => draft + 1);
      });
    } else if (state === 'leave') {
      nextFrame(() => {
        dataRef.current.state = 'leaving';
        setStartTransition((draft) => draft + 1);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dIn]);

  useEffect(() => {
    if (dataRef.current.state === 'entering' || dataRef.current.state === 'leaving') {
      dataRef.current.clearTid?.();
      const during = isNumber(dDuring) ? dDuring : dIn ? dDuring.enter : dDuring.leave;
      dataRef.current.clearTid = async.setTimeout(() => {
        dIn ? afterEnter?.() : afterLeave?.();
        dataRef.current.state = dIn ? 'entered' : 'leaved';
        forceUpdate();
      }, during);
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
