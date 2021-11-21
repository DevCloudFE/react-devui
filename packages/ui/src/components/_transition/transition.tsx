import type { ThrottleByAnimationFrame } from '../../hooks/throttle';

import { isFunction, isNumber, isString, isUndefined } from 'lodash';
import React, { useMemo, useImperativeHandle, useCallback, useLayoutEffect, useState } from 'react';
import { useImmer } from 'use-immer';

import { useAsync, useThrottle } from '../../hooks';
import { getMaxTime, CssRecord } from './utils';

export interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}

export interface DTransitionCallbackList {
  init?: (el: HTMLElement) => void;
  beforeEnter?: (el: HTMLElement) => void;
  enter?: (el: HTMLElement) => void;
  afterEnter?: (el: HTMLElement, setCss: CssRecord['setCss']) => void;
  beforeLeave?: (el: HTMLElement) => void;
  leave?: (el: HTMLElement) => void;
  afterLeave?: (el: HTMLElement, setCss: CssRecord['setCss']) => void;
}

export interface DTransitionProps {
  dEl: HTMLElement | null;
  dVisible?: boolean;
  dStateList?: DTransitionStateList | ((el: HTMLElement) => DTransitionStateList | undefined);
  dCallbackList?: DTransitionCallbackList | ((el: HTMLElement) => DTransitionCallbackList | undefined);
  dDestroy?: boolean;
  dHidden?: boolean;
  dSkipFirst?: boolean;
  children: React.ReactNode;
}

export interface DTransitionRef {
  transitionThrottle: ThrottleByAnimationFrame;
}

export const DTransition = React.forwardRef<DTransitionRef, DTransitionProps>((props, ref) => {
  const { dEl, dVisible = false, dStateList, dCallbackList, dDestroy = false, dHidden = true, dSkipFirst = true, children } = props;

  const [currentData] = useState({
    first: dSkipFirst && dVisible,
  });

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame } = useThrottle();
  const [cssRecord] = useImmer(() => new CssRecord());

  const [hidden, setHidden] = useImmer(!dVisible);

  const transition = useCallback(() => {
    if (dEl && !isUndefined(dStateList)) {
      cssRecord.backCss(dEl);
      asyncCapture.clearAll();
      throttleByAnimationFrame.skipThrottle();

      const stateList = isFunction(dStateList) ? dStateList(dEl) ?? {} : dStateList;
      const callbackList = isUndefined(dCallbackList) ? {} : isFunction(dCallbackList) ? dCallbackList(dEl) ?? {} : dCallbackList;

      callbackList[dVisible ? 'beforeEnter' : 'beforeLeave']?.(dEl);
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
        callbackList[dVisible ? 'enter' : 'leave']?.(dEl);

        const timeout = getMaxTime(
          dVisible
            ? [stateList['enter-from']?.transition, stateList['enter-active']?.transition, stateList['enter-to']?.transition]
            : [stateList['leave-from']?.transition, stateList['leave-active']?.transition, stateList['leave-to']?.transition]
        );
        asyncCapture.setTimeout(() => {
          if (!dVisible) {
            setHidden(true);
          }
          cssRecord.backCss(dEl);
          callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.(dEl, cssRecord.setCss.bind(cssRecord));
          throttleByAnimationFrame.continueThrottle();
        }, timeout);
      }, 20);
    }
  }, [asyncCapture, cssRecord, dCallbackList, dEl, dStateList, dVisible, setHidden, throttleByAnimationFrame]);

  //#region DidUpdate
  useLayoutEffect(() => {
    if (dVisible) {
      setHidden(false);
    } else if (dEl) {
      transition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dEl, dVisible]);

  useLayoutEffect(() => {
    if (dEl && !hidden) {
      if (currentData.first) {
        currentData.first = false;
      } else {
        transition();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dEl, hidden]);

  useImperativeHandle(
    ref,
    () => ({
      transitionThrottle: throttleByAnimationFrame,
    }),
    [throttleByAnimationFrame]
  );

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
      ..._child.props,
      style: {
        ..._child.props.style,
        display: !dDestroy && dHidden && hidden ? 'none' : undefined,
      },
    });
  }, [children, dDestroy, dHidden, hidden]);

  return dDestroy && hidden ? null : child;
});

export interface DCollapseTransitionProps {
  dEl: HTMLElement | null;
  dVisible?: boolean;
  dCallbackList?: DTransitionCallbackList;
  dDirection?: 'width' | 'height';
  dDuring?: number;
  dTimingFunction?: string | { enter: string; leave: string };
  dSpace?: number | string;
  dDestroy?: boolean;
  dHidden?: boolean;
  dSkipFirst?: boolean;
  children: React.ReactNode;
}

export const DCollapseTransition = React.forwardRef<DTransitionRef, DCollapseTransitionProps>((props, ref) => {
  const { dCallbackList, dDirection = 'height', dTimingFunction, dDuring = 300, dSpace = 0, ...restProps } = props;

  const enterTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.enter) : 'linear';
  const leaveTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.leave) : 'linear';
  const opacity = dSpace === 0 ? '0' : '1';

  return (
    <DTransition
      {...restProps}
      dStateList={(el) => {
        const rect = el.getBoundingClientRect();
        // handle nested
        if (rect[dDirection] === 0) {
          return undefined;
        }
        return {
          'enter-from': { [dDirection]: isNumber(dSpace) ? dSpace + 'px' : dSpace, opacity },
          'enter-active': { overflow: 'hidden' },
          'enter-to': {
            transition: `${dDirection} ${dDuring}ms ${enterTimeFunction}, opacity ${dDuring}ms ${enterTimeFunction}`,
            [dDirection]: rect[dDirection] + 'px',
          },
          'leave-from': { [dDirection]: rect[dDirection] + 'px' },
          'leave-active': { overflow: 'hidden' },
          'leave-to': {
            transition: `${dDirection} ${dDuring}ms ${leaveTimeFunction}, opacity ${dDuring}ms ${leaveTimeFunction}`,
            [dDirection]: isNumber(dSpace) ? dSpace + 'px' : dSpace,
            opacity,
          },
        };
      }}
      dCallbackList={{
        ...dCallbackList,
        afterLeave: (el, setCss) => {
          dCallbackList?.afterLeave?.(el, setCss);
          setCss(el, { [dDirection]: isNumber(dSpace) ? dSpace + 'px' : dSpace });
        },
      }}
    />
  );
});
