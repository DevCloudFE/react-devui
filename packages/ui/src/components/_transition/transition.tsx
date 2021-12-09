/* eslint-disable react-hooks/exhaustive-deps */

import { isFunction, isNumber, isString } from 'lodash';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useAsync, useImmer } from '../../hooks';
import { CssRecord, getMaxTime } from './utils';

export interface DTransitionStateList {
  'enter-from'?: Partial<CSSStyleDeclaration>;
  'enter-active'?: Partial<CSSStyleDeclaration>;
  'enter-to'?: Partial<CSSStyleDeclaration>;
  'leave-from'?: Partial<CSSStyleDeclaration>;
  'leave-active'?: Partial<CSSStyleDeclaration>;
  'leave-to'?: Partial<CSSStyleDeclaration>;
}

export interface DTransitionCallbackList {
  beforeEnter: (el: HTMLElement) => DTransitionStateList | undefined;
  enter?: (el: HTMLElement) => void;
  afterEnter?: (el: HTMLElement) => void;
  beforeLeave: (el: HTMLElement) => DTransitionStateList | undefined;
  leave?: (el: HTMLElement) => void;
  afterLeave?: (el: HTMLElement) => void;
}

export interface DTransitionProps {
  dEl: HTMLElement | null;
  dVisible?: boolean;
  dCallbackList?: DTransitionCallbackList;
  dEndStyle?: { enter?: Partial<CSSStyleDeclaration>; leave?: Partial<CSSStyleDeclaration> };
  dSkipFirst?: boolean;
  dRender: (hidden: boolean) => React.ReactNode;
}

export function DTransition(props: DTransitionProps) {
  const { dEl, dVisible = false, dCallbackList, dEndStyle, dSkipFirst = true, dRender } = props;

  const dataRef = useRef({
    hasfirstRun: false,
    elRendered: true,
    preVisible: dVisible,
  });

  const asyncCapture = useAsync();
  const [hidden, setHidden] = useImmer(!dVisible);
  const [cssRecord] = useImmer(() => new CssRecord());

  const [startEnterTransition, setStartEnterTransition] = useState(0);

  const transition = () => {
    if (dEl) {
      cssRecord.backCss(dEl);
      asyncCapture.clearAll();

      const callbackList = dCallbackList ?? {};
      const stateList = callbackList[dVisible ? 'beforeEnter' : 'beforeLeave'](dEl) ?? {};

      cssRecord.setCss(dEl, {
        ...stateList[dVisible ? 'enter-from' : 'leave-from'],
        ...stateList[dVisible ? 'enter-active' : 'leave-active'],
      });

      asyncCapture.requestAnimationFrame(() => {
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
            cssRecord.backCss(dEl);
            cssRecord.setCss(dEl, (dVisible ? dEndStyle?.enter : dEndStyle?.leave) ?? {});
            callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.(dEl);
            flushSync(() => {
              if (!dVisible) {
                setHidden(true);
              }
            });
          }, timeout);
        });
      });
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
    if (!dataRef.current.hasfirstRun) {
      if (!dSkipFirst) {
        dataRef.current.hasfirstRun = true;
        prepareTransition();
      } else if (dEl) {
        dataRef.current.hasfirstRun = true;
        const callbackList = isFunction(dCallbackList) ? dCallbackList() ?? {} : dCallbackList ?? {};
        callbackList[dVisible ? 'beforeEnter' : 'beforeLeave'](dEl);
        callbackList[dVisible ? 'enter' : 'leave']?.(dEl);
        callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.(dEl);
      }
    }
  }, [dEl]);

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

  return <>{dRender(hidden)}</>;
}

export interface DCollapseTransitionProps extends DTransitionProps {
  dDirection?: 'horizontal' | 'vertical';
  dDuring?: number;
  dTimingFunction?: string | { enter: string; leave: string };
  dSpace?: number | string;
}

export function DCollapseTransition(props: DCollapseTransitionProps) {
  const { dEl, dCallbackList, dDirection = 'vertical', dTimingFunction, dDuring = 300, dSpace = 0, ...restProps } = props;

  const enterTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.enter) : 'linear';
  const leaveTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.leave) : 'linear';

  const shouldHidden = dSpace === 0;

  const space = isNumber(dSpace) ? dSpace + 'px' : dSpace;
  const opacity = shouldHidden ? '0' : '1';

  const attribute = dDirection === 'horizontal' ? 'width' : 'height';

  const getTransitionState = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    // handle nested
    if (rect[attribute] === 0) {
      return undefined;
    }

    const size = rect[attribute] + 'px';

    return {
      'enter-from': { [attribute]: space, opacity },
      'enter-active': { overflow: 'hidden' },
      'enter-to': {
        [attribute]: size,
        transition: `${attribute} ${dDuring}ms ${enterTimeFunction}, opacity ${dDuring}ms ${enterTimeFunction}`,
      },
      'leave-from': { [attribute]: size },
      'leave-active': { overflow: 'hidden' },
      'leave-to': {
        [attribute]: space,
        opacity,
        transition: `${attribute} ${dDuring}ms ${leaveTimeFunction}, opacity ${dDuring}ms ${leaveTimeFunction}`,
      },
    };
  };

  return (
    <DTransition
      {...restProps}
      dEl={dEl}
      dCallbackList={{
        ...dCallbackList,
        beforeEnter: (el) => dCallbackList?.beforeEnter(el) ?? getTransitionState(el),
        beforeLeave: (el) => dCallbackList?.beforeLeave(el) ?? getTransitionState(el),
      }}
      dEndStyle={shouldHidden ? undefined : { leave: { [attribute]: space } }}
    />
  );
}
