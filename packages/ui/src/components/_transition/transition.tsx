/* eslint-disable react-hooks/exhaustive-deps */
import type { ThrottleByAnimationFrame } from '../../hooks/throttle-and-debounce';

import { isFunction, isNumber, isString } from 'lodash';
import React, { useImperativeHandle, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { count, first, mergeWith, take, timer } from 'rxjs';

import { useAsync, useThrottle, useImmer } from '../../hooks';
import { CssRecord, getTransitinNum, getMaxTime } from './utils';

export interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}

export interface DTransitionCallbackList {
  beforeEnter?: () => void;
  enter?: () => void;
  afterEnter?: () => void;
  beforeLeave?: () => void;
  leave?: () => void;
  afterLeave?: () => void;
}

export interface DTransitionRef {
  transitionThrottle: ThrottleByAnimationFrame;
}

export interface DTransitionProps {
  dEl: HTMLElement | null;
  dVisible?: boolean;
  dStateList?: DTransitionStateList | (() => DTransitionStateList | undefined);
  dCallbackList?: DTransitionCallbackList | (() => DTransitionCallbackList | undefined);
  dEndStyle?: { enter?: Partial<CSSStyleDeclaration>; leave?: Partial<CSSStyleDeclaration> };
  dSkipFirst?: boolean;
  dRender: (hidden: boolean) => React.ReactNode;
}

export const DTransition = React.forwardRef<DTransitionRef, DTransitionProps>((props, ref) => {
  const { dEl, dVisible = false, dStateList, dCallbackList, dEndStyle, dSkipFirst = true, dRender } = props;

  const dataRef = useRef({
    elRendered: true,
    preVisible: dVisible,
  });

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const [hidden, setHidden] = useImmer(!dVisible);
  const [cssRecord] = useImmer(() => new CssRecord());

  const [startEnterTransition, setStartEnterTransition] = useState(0);

  const transition = () => {
    if (dEl) {
      cssRecord.backCss(dEl);
      asyncCapture.clearAll();
      throttleByAnimationFrame.skipThrottle();

      const stateList = isFunction(dStateList) ? dStateList() ?? {} : dStateList ?? {};
      const callbackList = isFunction(dCallbackList) ? dCallbackList() ?? {} : dCallbackList ?? {};

      callbackList[dVisible ? 'beforeEnter' : 'beforeLeave']?.();
      cssRecord.setCss(dEl, {
        ...stateList[dVisible ? 'enter-from' : 'leave-from'],
        ...stateList[dVisible ? 'enter-active' : 'leave-active'],
      });

      asyncCapture.setTimeout(() => {
        cssRecord.backCss(dEl);
        cssRecord.setCss(dEl, {
          ...stateList[dVisible ? 'enter-to' : 'leave-to'],
          ...stateList[dVisible ? 'enter-active' : 'leave-active'],
        });
        callbackList[dVisible ? 'enter' : 'leave']?.();

        const transitinNum = getTransitinNum(
          dVisible
            ? [stateList['enter-from']?.transition, stateList['enter-active']?.transition, stateList['enter-to']?.transition]
            : [stateList['leave-from']?.transition, stateList['leave-active']?.transition, stateList['leave-to']?.transition]
        );

        const timeout = getMaxTime(
          dVisible
            ? [stateList['enter-from']?.transition, stateList['enter-active']?.transition, stateList['enter-to']?.transition]
            : [stateList['leave-from']?.transition, stateList['leave-active']?.transition, stateList['leave-to']?.transition]
        );

        asyncCapture
          .fromEvent(dEl, 'transitionend')
          .pipe(take(transitinNum), count())
          .pipe(mergeWith(timer(timeout + 5)))
          .pipe(first())
          .subscribe(() => {
            cssRecord.backCss(dEl);
            cssRecord.setCss(dEl, (dVisible ? dEndStyle?.enter : dEndStyle?.leave) ?? {});
            callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.();
            flushSync(() => {
              if (!dVisible) {
                setHidden(true);
              }
            });
            throttleByAnimationFrame.continueThrottle();
          });
      }, 20);
    }
  };

  const prepareTransition = () => {
    dataRef.current.preVisible = dVisible;
    if (dVisible) {
      setHidden(false);
      if (dEl) {
        dataRef.current.elRendered = true;
        setStartEnterTransition((pre) => pre + 1);
      } else {
        dataRef.current.elRendered = false;
      }
    } else {
      dataRef.current.elRendered = true;
      transition();
    }
  };

  //#region DidUpdate
  useLayoutEffect(() => {
    transition();
  }, [startEnterTransition]);

  useEffect(() => {
    if (!dSkipFirst) {
      prepareTransition();
    }
  }, []);

  useEffect(() => {
    if (dVisible !== dataRef.current.preVisible) {
      prepareTransition();
    }
  }, [dVisible]);

  useLayoutEffect(() => {
    if (!hidden && dEl && !dataRef.current.elRendered) {
      dataRef.current.elRendered = true;
      transition();
    }
  }, [dEl, hidden]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      transitionThrottle: throttleByAnimationFrame,
    }),
    [throttleByAnimationFrame]
  );

  return <>{dRender(hidden)}</>;
});

export interface DCollapseTransitionProps extends DTransitionProps {
  dDirection?: 'width' | 'height';
  dDuring?: number;
  dTimingFunction?: string | { enter: string; leave: string };
  dSpace?: number | string;
}

export const DCollapseTransition = React.forwardRef<DTransitionRef, DCollapseTransitionProps>((props, ref) => {
  const { dEl, dCallbackList, dDirection = 'height', dTimingFunction, dDuring = 300, dSpace = 0, ...restProps } = props;

  const enterTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.enter) : 'linear';
  const leaveTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.leave) : 'linear';

  const shouldHidden = dSpace === 0;

  const space = isNumber(dSpace) ? dSpace + 'px' : dSpace;
  const opacity = shouldHidden ? '0' : '1';

  return (
    <DTransition
      {...restProps}
      ref={ref}
      dEl={dEl}
      dStateList={() => {
        if (dEl) {
          const rect = dEl.getBoundingClientRect();
          // handle nested
          if (rect[dDirection] === 0) {
            return undefined;
          }

          const size = rect[dDirection] + 'px';

          return {
            'enter-from': { [dDirection]: space, opacity },
            'enter-active': { overflow: 'hidden' },
            'enter-to': {
              [dDirection]: size,
              transition: `${dDirection} ${dDuring}ms ${enterTimeFunction}, opacity ${dDuring}ms ${enterTimeFunction}`,
            },
            'leave-from': { [dDirection]: size },
            'leave-active': { overflow: 'hidden' },
            'leave-to': {
              [dDirection]: space,
              opacity,
              transition: `${dDirection} ${dDuring}ms ${leaveTimeFunction}, opacity ${dDuring}ms ${leaveTimeFunction}`,
            },
          };
        }
      }}
      dEndStyle={shouldHidden ? undefined : { leave: { [dDirection]: space } }}
    />
  );
});
