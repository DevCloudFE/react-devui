import { isFunction, isNumber, isString, isUndefined } from 'lodash';
import React, { useMemo, useEffect, useImperativeHandle, useState } from 'react';
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
  dVisible?: boolean;
  dStateList?: DTransitionStateList | ((el: HTMLElement) => DTransitionStateList | undefined);
  dCallbackList?: DTransitionCallbackList | ((el: HTMLElement) => DTransitionCallbackList | undefined);
  dAutoHidden?: boolean;
  dSkipFirst?: boolean;
  children: React.ReactNode;
}

export interface DTransitionRef {
  el: HTMLElement | null;
  transitionThrottle: (cb: () => void) => void;
}

export const DTransition = React.forwardRef<DTransitionRef, DTransitionProps>((props, ref) => {
  const { dVisible = false, dStateList, dCallbackList, dAutoHidden = true, dSkipFirst = true, children } = props;

  const asyncCapture = useAsync();
  const { throttleByAnimationFrame, skipThrottle, continueThrottle } = useThrottle();

  const [currentData] = useState<{ visible?: boolean }>({
    visible: undefined,
  });

  //#region States.
  /*
   * @see https://reactjs.org/docs/state-and-lifecycle.html
   *
   * - Vue: data.
   * @see https://v3.vuejs.org/api/options-data.html#data-2
   * - Angular: property on a class.
   * @example
   * export class HeroChildComponent {
   *   public data: 'example';
   * }
   */
  const [cssRecord] = useImmer(new CssRecord());
  const [el, setEl] = useImmer<HTMLElement | null>(null);
  //#endregion

  //#region React.cloneElement.
  /*
   * @see https://reactjs.org/docs/react-api.html#cloneelement
   *
   * - Vue: Scoped Slots.
   * @see https://v3.vuejs.org/guide/component-slots.html#scoped-slots
   * - Angular: NgTemplateOutlet.
   * @see https://angular.io/api/common/NgTemplateOutlet
   */
  const child = useMemo(() => {
    const _child = children as React.ReactElement;
    return React.cloneElement(_child, {
      ..._child.props,
      ref: (node: HTMLElement | null) => {
        setEl(node);
      },
    });
  }, [children, setEl]);
  //#endregion

  if (el && isUndefined(currentData.visible) && !dVisible) {
    cssRecord.setCss(el, { display: 'none' });
    const callbackList = isUndefined(dCallbackList) ? {} : isFunction(dCallbackList) ? dCallbackList(el) ?? {} : dCallbackList;
    callbackList.init?.(el);
  }

  //#region DidUpdate.
  /*
   * We need a service(ReactConvertService) that implement useEffect.
   * @see https://reactjs.org/docs/hooks-effect.html
   *
   * - Vue: onUpdated.
   * @see https://v3.vuejs.org/api/composition-api.html#lifecycle-hooks
   * - Angular: ngDoCheck.
   * @see https://angular.io/api/core/DoCheck
   */
  useEffect(() => {
    if (el) {
      if (dSkipFirst && isUndefined(currentData.visible)) {
        currentData.visible = dVisible;
        dAutoHidden && cssRecord.setCss(el, { display: dVisible ? '' : 'none' });
      } else if (currentData.visible !== dVisible) {
        currentData.visible = dVisible;
        cssRecord.backCss(el);
        asyncCapture.clearAll();

        if (!isUndefined(dStateList)) {
          skipThrottle();

          const stateList = isFunction(dStateList) ? dStateList(el) ?? {} : dStateList;
          const callbackList = isUndefined(dCallbackList) ? {} : isFunction(dCallbackList) ? dCallbackList(el) ?? {} : dCallbackList;

          callbackList[dVisible ? 'beforeEnter' : 'beforeLeave']?.(el);
          cssRecord.setCss(el, {
            ...stateList[dVisible ? 'enter-from' : 'leave-from'],
            ...stateList[dVisible ? 'enter-active' : 'leave-active'],
          });

          asyncCapture.setTimeout(() => {
            cssRecord.backCss(el);
            cssRecord.setCss(el, {
              ...stateList[dVisible ? 'enter-to' : 'leave-to'],
              ...stateList[dVisible ? 'enter-active' : 'leave-active'],
            });
            callbackList[dVisible ? 'enter' : 'leave']?.(el);

            const timeout = getMaxTime(
              dVisible
                ? [stateList['enter-from']?.transition, stateList['enter-active']?.transition, stateList['enter-to']?.transition]
                : [stateList['leave-from']?.transition, stateList['leave-active']?.transition, stateList['leave-to']?.transition]
            );
            asyncCapture.setTimeout(() => {
              cssRecord.backCss(el);
              dAutoHidden && cssRecord.setCss(el, { display: dVisible ? '' : 'none' });
              callbackList[dVisible ? 'afterEnter' : 'afterLeave']?.(el, cssRecord.setCss.bind(cssRecord));
              continueThrottle();
            }, timeout);
          }, 20);
        }
      }
    }
  }, [
    dCallbackList,
    dStateList,
    el,
    dVisible,
    dAutoHidden,
    dSkipFirst,
    asyncCapture,
    currentData,
    cssRecord,
    skipThrottle,
    continueThrottle,
  ]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      el,
      transitionThrottle: throttleByAnimationFrame,
    }),
    [el, throttleByAnimationFrame]
  );

  return child;
});

export interface DCollapseTransitionProps {
  dVisible?: boolean;
  dCallbackList?: DTransitionCallbackList;
  dSkipFirst?: boolean;
  dDirection?: 'width' | 'height';
  dDuring?: number;
  dTimingFunction?: string | { enter: string; leave: string };
  dSpace?: number | string;
  children: React.ReactNode;
}

export const DCollapseTransition = React.forwardRef<DTransitionRef, DCollapseTransitionProps>((props, ref) => {
  const {
    dVisible = false,
    dCallbackList,
    dSkipFirst = true,
    dDirection = 'height',
    dTimingFunction,
    dDuring = 300,
    dSpace = 0,
    children,
  } = props;

  const enterTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.enter) : 'linear';
  const leaveTimeFunction = dTimingFunction ? (isString(dTimingFunction) ? dTimingFunction : dTimingFunction.leave) : 'linear';
  const opacity = dSpace === 0 ? '0' : '1';

  return (
    <DTransition
      ref={ref}
      dVisible={dVisible}
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
      dAutoHidden={dSpace === 0}
      dSkipFirst={dSkipFirst}
    >
      {children}
    </DTransition>
  );
});
