import type { DElementSelector } from '../../hooks/element';
import type { DTransitionRef } from '../_transition';

import { isUndefined } from 'lodash';
import React, { useEffect, useCallback, useMemo, useImperativeHandle, useState } from 'react';
import ReactDOM from 'react-dom';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useLockScroll, useCustomRef, useId, useAsync, useElement } from '../../hooks';
import { getClassName, globalMaxIndexManager, globalEscStack, globalScrollCapture, getFillingStyle } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';

export type DDrawerContextData = { id: number; onClose?: () => void } | null;
export const DDrawerContext = React.createContext<DDrawerContextData>(null);

export interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dContainer?: DElementSelector | false;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dWidth?: number | string;
  dHeight?: number | string;
  dZIndex?: number;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dHeader?: React.ReactNode;
  dFooter?: React.ReactNode;
  dChildDrawer?: React.ReactNode;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
}

export interface DDrawerRef {
  el: HTMLDivElement | null;
  updatePosition: () => void;
}

export const DDrawer = React.forwardRef<DDrawerRef, DDrawerProps>((props, ref) => {
  const {
    dVisible = false,
    dContainer,
    dPlacement = 'right',
    dWidth = 400,
    dHeight = 280,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dHeader,
    dFooter,
    dChildDrawer,
    onClose,
    afterVisibleChange,
    __onVisibleChange,
    className,
    style,
    children,
    ...restProps
  } = useDComponentConfig('drawer', props);

  const dPrefix = useDPrefixConfig();
  const asyncCapture = useAsync();

  const [currentData] = useState<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  //#region Refs.
  /*
   * @see https://reactjs.org/docs/refs-and-the-dom.html
   *
   * - Vue: ref.
   * @see https://v3.vuejs.org/guide/component-template-refs.html
   * - Angular: ViewChild.
   * @see https://angular.io/api/core/ViewChild
   */
  const [drawerEl, drawerRef] = useCustomRef<HTMLDivElement>();
  const [contentRefContent, contentRef] = useCustomRef<DTransitionRef>();
  //#endregion

  //#region Element
  const handleContainer = useCallback(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById(`${dPrefix}drawer-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}drawer-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return drawerEl?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, drawerEl?.parentElement]);
  const containerEl = useElement(dContainer, handleContainer);
  //#endregion

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
  const id = useId();

  const [drawerPositionStyle, setDrawerPositionStyle] = useImmer<React.CSSProperties>({});

  const [distance, setDistance] = useImmer<{ visible: boolean; top: number; right: number; bottom: number; left: number }>({
    visible: false,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const [zIndex, setZIndex] = useImmer(1000);
  //#endregion

  //#region Getters.
  /*
   * When the dependency changes, recalculate the value.
   * In React, usually use `useMemo` to handle this situation.
   * Notice: `useCallback` also as getter that target at function.
   *
   * - Vue: computed.
   * @see https://v3.vuejs.org/guide/computed.html#computed-properties
   * - Angular: get property on a class.
   * @example
   * // ReactConvertService is a service that implement the
   * // methods when need to convert react to angular.
   * export class HeroChildComponent {
   *   public get data():string {
   *     return this.reactConvert.useMemo(factory, [deps]);
   *   }
   *
   *   constructor(private reactConvert: ReactConvertService) {}
   * }
   */

  const handleMaskClose = useCallback(() => {
    if (dMaskClosable) {
      onClose?.();
    }
  }, [dMaskClosable, onClose]);

  const updatePosition = useCallback(() => {
    if (drawerEl) {
      if (isUndefined(dContainer)) {
        setDrawerPositionStyle({
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        });
      } else if (containerEl.current) {
        setDrawerPositionStyle({
          position: 'absolute',
          ...getFillingStyle(drawerEl, containerEl.current, false),
        });
      }
    }
  }, [dContainer, drawerEl, containerEl, setDrawerPositionStyle]);
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
  const childDrawer = useMemo(() => {
    if (!isUndefined(dChildDrawer)) {
      const _childDrawer = React.Children.only(dChildDrawer) as React.ReactElement;
      return React.cloneElement(_childDrawer, {
        ..._childDrawer.props,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        __onVisibleChange: (distance: any) => {
          setDistance(distance);
        },
      });
    }
    return null;
  }, [dChildDrawer, setDistance]);
  //#endregion

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
    if (dVisible) {
      if (isUndefined(dZIndex)) {
        if (isUndefined(dContainer)) {
          const [key, maxZIndex] = globalMaxIndexManager.getMaxIndex();
          setZIndex(maxZIndex);
          return () => {
            globalMaxIndexManager.deleteRecord(key);
          };
        } else {
          setZIndex(10);
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [dVisible, dContainer, dZIndex, setZIndex]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible && containerEl.current && contentRefContent) {
      asyncGroup.onResize(containerEl.current, () => contentRefContent.transitionThrottle(updatePosition));
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [dVisible, asyncCapture, contentRefContent, containerEl, updatePosition]);

  useEffect(() => {
    if (dVisible && contentRefContent) {
      const tid = globalScrollCapture.addTask(() => contentRefContent.transitionThrottle(updatePosition));
      return () => {
        globalScrollCapture.deleteTask(tid);
      };
    }
  }, [dVisible, contentRefContent, updatePosition]);

  useEffect(() => {
    if (dVisible) {
      globalEscStack.stackPush(id, () => onClose?.());
      return () => {
        globalEscStack.stackDelete(id);
      };
    }
  }, [dVisible, id, onClose]);

  useEffect(() => {
    if (contentRefContent) {
      contentRefContent.transitionThrottle(updatePosition);
    }
  }, [contentRefContent, updatePosition]);

  useLockScroll(dVisible && isUndefined(dContainer));
  //#endregion

  const contextValue = useMemo(() => ({ id, onClose }), [id, onClose]);

  useImperativeHandle(
    ref,
    () => ({
      el: drawerEl,
      updatePosition,
    }),
    [drawerEl, updatePosition]
  );

  const drawerNode = (
    <DDrawerContext.Provider value={contextValue}>
      <div
        {...restProps}
        ref={drawerRef}
        className={getClassName(className, `${dPrefix}drawer`)}
        style={{
          ...style,
          zIndex,
          transition: `transform 140ms ${distance.visible ? 'ease-out' : 'ease-in'} 60ms`,
          transform:
            dPlacement === 'top'
              ? `translateY(${(distance[dPlacement] / 3) * 2}px)`
              : dPlacement === 'right'
              ? `translateX(${-(distance[dPlacement] / 3) * 2}px)`
              : dPlacement === 'bottom'
              ? `translateY(${-(distance[dPlacement] / 3) * 2}px)`
              : `translateX(${(distance[dPlacement] / 3) * 2}px)`,
          ...drawerPositionStyle,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dHeader ? `${dPrefix}drawer-content__header-${id}` : undefined}
        aria-describedby={`${dPrefix}drawer-content-${id}`}
      >
        {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
        <DTransition
          ref={contentRef}
          dVisible={dVisible}
          dStateList={() => {
            const transform =
              dPlacement === 'top'
                ? 'translate(0, -100%)'
                : dPlacement === 'right'
                ? 'translate(100%, 0)'
                : dPlacement === 'bottom'
                ? 'translate(0, 100%)'
                : 'translate(-100%, 0)';
            return {
              'enter-from': { transform },
              'enter-to': { transition: 'transform 0.2s ease-out' },
              'leave-to': { transform, transition: 'transform 0.2s ease-in' },
            };
          }}
          dCallbackList={() => {
            return {
              data: {
                cb: undefined,
              },
              init: () => {
                if (drawerEl) {
                  drawerEl.style.display = dVisible ? '' : 'none';
                }
              },
              beforeEnter: (el) => {
                drawerEl && (drawerEl.style.display = '');
                const rect = el.getBoundingClientRect();
                __onVisibleChange?.({
                  visible: true,
                  top: distance.top + (dPlacement === 'top' ? rect.height : 0),
                  right: distance.right + (dPlacement === 'right' ? rect.width : 0),
                  bottom: distance.bottom + (dPlacement === 'bottom' ? rect.height : 0),
                  left: distance.left + (dPlacement === 'left' ? rect.width : 0),
                });
              },
              afterEnter: (el) => {
                afterVisibleChange?.(true);
                currentData.preActiveEl = document.activeElement as HTMLElement | null;
                el.focus({ preventScroll: true });
              },
              beforeLeave: () => {
                currentData.preActiveEl?.focus({ preventScroll: true });
                __onVisibleChange?.({
                  ...distance,
                  visible: false,
                });
              },
              afterLeave: () => {
                afterVisibleChange?.(false);
                drawerEl && (drawerEl.style.display = 'none');
              },
            };
          }}
        >
          <div
            id={`${dPrefix}drawer-content-${id}`}
            className={getClassName(`${dPrefix}drawer-content`, `${dPrefix}drawer-content--${dPlacement}`)}
            style={{
              width: dPlacement === 'left' || dPlacement === 'right' ? dWidth : undefined,
              height: dPlacement === 'bottom' || dPlacement === 'top' ? dHeight : undefined,
            }}
            tabIndex={-1}
          >
            {dHeader}
            <div className={`${dPrefix}drawer-content__body`}>{children}</div>
            {dFooter}
          </div>
        </DTransition>
      </div>
      {childDrawer}
    </DDrawerContext.Provider>
  );

  return dContainer === false ? drawerNode : containerEl.current && ReactDOM.createPortal(drawerNode, containerEl.current);
});
