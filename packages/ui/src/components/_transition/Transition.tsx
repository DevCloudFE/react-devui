import { isArray, isNumber } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAsync } from '@react-devui/hooks';

export type DTransitionState = 'enter' | 'entering' | 'entered' | 'leave' | 'leaving' | 'leaved';

export interface DTransitionProps {
  children: (state: DTransitionState) => JSX.Element | null;
  dIn: boolean;
  dDuring: number | { enter: number; leave: number };
  dMountBeforeFirstEnter?: boolean;
  dSkipFirstTransition?: boolean | [boolean, boolean];
  dDestroyWhenLeaved?: boolean;
  onEnter?: () => void;
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
    dDestroyWhenLeaved = false,
    onEnter,
    afterEnter,
    afterLeave,
  } = props;

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

  const [stateChange, setStateChange] = useState(0);

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
        setStateChange((prevStateChange) => prevStateChange + 1);
      });
    } else if (state === 'leave') {
      nextFrame(() => {
        dataRef.current.state = 'leaving';
        setStateChange((prevStateChange) => prevStateChange + 1);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dIn]);

  useEffect(() => {
    if (dataRef.current.state === 'entering' || dataRef.current.state === 'leaving') {
      const during = isNumber(dDuring) ? dDuring : dIn ? dDuring.enter : dDuring.leave;
      dataRef.current.clearTid = async.setTimeout(() => {
        dataRef.current.state = dIn ? 'entered' : 'leaved';
        setStateChange((prevStateChange) => prevStateChange + 1);
      }, during);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateChange]);

  useEffect(() => {
    if (dataRef.current.state === 'entered' || dataRef.current.state === 'leaved') {
      dIn ? afterEnter?.() : afterLeave?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateChange]);

  const shouldRender = (() => {
    if (state === 'leaved' && dDestroyWhenLeaved) {
      return false;
    }

    if (dataRef.current.isFirstEnter && !dMountBeforeFirstEnter) {
      return false;
    }

    return true;
  })();

  return shouldRender ? children(state) : null;
}
