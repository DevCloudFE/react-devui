import { isFunction } from 'lodash';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useAsync } from '../async';
import { useImmer } from '../immer';
import { useIsomorphicLayoutEffect } from '../layout-effect';
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
  dSkipFirst?: boolean;
  afterEnter?: () => void;
  afterLeave?: () => void;
}

export function useDTransition(props: DTransitionProps) {
  const { dEl, dVisible = false, dCallbackList, dSkipFirst = true, afterEnter, afterLeave } = props;

  const dataRef = useRef({
    hasfirstRun: false,
    elRendered: true,
    preVisible: dVisible,
  });

  const asyncCapture = useAsync();
  const [hidden, setHidden] = useState(!dVisible);
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
            callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.(dEl);
            dVisible ? afterEnter?.() : afterLeave?.();
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

  useIsomorphicLayoutEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dEl]);

  useIsomorphicLayoutEffect(() => {
    if (!hidden && dEl && !dataRef.current.elRendered) {
      dataRef.current.elRendered = true;
      transition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dEl, hidden]);

  useIsomorphicLayoutEffect(() => {
    if (dVisible !== dataRef.current.preVisible) {
      prepareTransition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dVisible]);

  useIsomorphicLayoutEffect(() => {
    transition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startEnterTransition]);

  return hidden;
}

export interface DCollapseTransitionProps extends DTransitionProps {
  dDirection?: 'horizontal' | 'vertical';
  dDuring?: number;
}

export function useDCollapseTransition(props: DCollapseTransitionProps) {
  const { dVisible, dCallbackList, dDirection = 'vertical', ...restProps } = props;

  const attribute = dDirection === 'horizontal' ? 'width' : 'height';

  const getTransitionState = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    // handle nested
    if (rect[attribute] === 0) {
      return undefined;
    }

    const size = rect[attribute] + 'px';
    const callbackList = dCallbackList ?? {};
    const stateList = callbackList[dVisible ? 'beforeEnter' : 'beforeLeave'](el) ?? {};

    return {
      ...stateList,
      'enter-active': {
        ...stateList['enter-active'],
        overflow: 'hidden',
      },
      'enter-to': {
        ...stateList['enter-to'],
        [attribute]: size,
      },
      'leave-from': {
        ...stateList['leave-from'],
        [attribute]: size,
      },
      'leave-active': {
        ...stateList['leave-active'],
        overflow: 'hidden',
      },
    };
  };

  return useDTransition({
    ...restProps,
    dVisible,
    dCallbackList: {
      ...dCallbackList,
      beforeEnter: (el) => getTransitionState(el),
      beforeLeave: (el) => getTransitionState(el),
    },
  });
}
