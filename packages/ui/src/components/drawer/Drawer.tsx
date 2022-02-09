import type { DElementSelector } from '../../hooks/element';
import type { Updater } from '../../hooks/two-way-binding';

import { isUndefined } from 'lodash';
import React, { useCallback, useId, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useElement,
  useImmer,
  useRefCallback,
  useLockScroll,
  useDTransition,
  useMaxIndex,
} from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';
import { DDialog } from '../_dialog';

export interface DDrawerContextData {
  gId: string;
  gCloseDrawer: () => void;
}
export const DDrawerContext = React.createContext<DDrawerContextData | null>(null);

export interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, Updater<boolean>?];
  dContainer?: DElementSelector | false;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dWidth?: number | string;
  dHeight?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dHeader?: React.ReactNode;
  dFooter?: React.ReactNode;
  dDestroy?: boolean;
  dChildDrawer?: React.ReactNode;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
  __zIndex?: number | string;
}

const { COMPONENT_NAME } = generateComponentMate('DDrawer');
export function DDrawer(props: DDrawerProps) {
  const {
    dVisible,
    dContainer,
    dPlacement = 'right',
    dWidth = 400,
    dHeight = 280,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
    dHeader,
    dFooter,
    dDestroy = false,
    dChildDrawer,
    onClose,
    afterVisibleChange,
    __onVisibleChange,
    __zIndex,
    className,
    style,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogEl, dialogRef] = useRefCallback<HTMLDivElement>();
  const [dialogContentEl, dialogContentRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  const uniqueId = useId();

  const [visible, setVisible] = dVisible;

  const transitionState = (() => {
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
  })();
  const hidden = useDTransition({
    dEl: dialogContentEl,
    dVisible: visible,
    dCallbackList: {
      beforeEnter: (el) => {
        const rect = el.getBoundingClientRect();
        __onVisibleChange?.({
          visible: true,
          top: distance.top + (dPlacement === 'top' ? rect.height : 0),
          right: distance.right + (dPlacement === 'right' ? rect.width : 0),
          bottom: distance.bottom + (dPlacement === 'bottom' ? rect.height : 0),
          left: distance.left + (dPlacement === 'left' ? rect.width : 0),
        });

        return transitionState;
      },
      afterEnter: (el) => {
        dataRef.current.preActiveEl = document.activeElement as HTMLElement | null;
        el.focus({ preventScroll: true });
      },
      beforeLeave: () => {
        dataRef.current.preActiveEl?.focus({ preventScroll: true });
        __onVisibleChange?.({
          ...distance,
          visible: false,
        });
        return transitionState;
      },
    },
    afterEnter: () => {
      afterVisibleChange?.(true);
    },
    afterLeave: () => {
      afterVisibleChange?.(false);
    },
  });

  const isFixed = isUndefined(dContainer);

  const maxZIndex = useMaxIndex(!hidden);
  const zIndex = useMemo(() => {
    if (!hidden) {
      if (!isUndefined(dZIndex)) {
        return dZIndex;
      }
      if (isUndefined(__zIndex)) {
        if (isFixed) {
          return maxZIndex;
        } else {
          return `var(--${dPrefix}zindex-absolute)`;
        }
      } else {
        return __zIndex;
      }
    }
  }, [__zIndex, dPrefix, dZIndex, hidden, isFixed, maxZIndex]);

  const handleContainer = useCallback(() => {
    if (isFixed) {
      let el = document.getElementById(`${dPrefix}drawer-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}drawer-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return dialogEl?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, dialogEl, isFixed]);
  const containerEl = useElement(dContainer, handleContainer);

  const [distance, setDistance] = useImmer<{ visible: boolean; top: number; right: number; bottom: number; left: number }>({
    visible: false,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const closeDrawer = useCallback(() => {
    setVisible?.(false);
    onClose?.();
  }, [onClose, setVisible]);

  useLockScroll(isFixed && !hidden);

  const childDrawer = useMemo(() => {
    if (dChildDrawer) {
      const childDrawer = React.Children.only(dChildDrawer) as React.ReactElement<DDrawerProps>;
      return React.cloneElement<DDrawerProps>(childDrawer, {
        ...childDrawer.props,
        __onVisibleChange: (distance) => {
          setDistance(distance);
        },
        __zIndex: isUndefined(zIndex) ? zIndex : `calc(${zIndex} + 1)`,
      });
    }
    return null;
  }, [dChildDrawer, setDistance, zIndex]);

  const contextValue = useMemo<DDrawerContextData>(
    () => ({
      gId: uniqueId,
      gCloseDrawer: closeDrawer,
    }),
    [closeDrawer, uniqueId]
  );

  const drawerNode = (
    <>
      <DDialog
        {...restProps}
        className={getClassName(className, `${dPrefix}drawer`)}
        style={mergeStyle(
          {
            position: isFixed ? undefined : 'absolute',
            transition: `transform 140ms ${distance.visible ? 'ease-out' : 'ease-in'} 60ms`,
            transform:
              dPlacement === 'top'
                ? `translateY(${(distance[dPlacement] / 3) * 2}px)`
                : dPlacement === 'right'
                ? `translateX(${-(distance[dPlacement] / 3) * 2}px)`
                : dPlacement === 'bottom'
                ? `translateY(${-(distance[dPlacement] / 3) * 2}px)`
                : `translateX(${(distance[dPlacement] / 3) * 2}px)`,
            zIndex,
          },
          style
        )}
        aria-labelledby={dHeader ? `${dPrefix}drawer-header-${uniqueId}` : undefined}
        aria-describedby={`${dPrefix}dialog-content-${uniqueId}`}
        dVisible={visible}
        dHidden={hidden}
        dMask={dMask}
        dMaskClosable={dMaskClosable}
        dEscClosable={dEscClosable}
        dDestroy={dDestroy}
        dDialogRef={dialogRef}
        onClose={closeDrawer}
      >
        <DDrawerContext.Provider value={contextValue}>
          <div
            ref={dialogContentRef}
            id={`${dPrefix}dialog-content-${uniqueId}`}
            className={getClassName(`${dPrefix}drawer__content`, `${dPrefix}drawer__content--${dPlacement}`)}
            style={{
              width: dPlacement === 'left' || dPlacement === 'right' ? dWidth : undefined,
              height: dPlacement === 'bottom' || dPlacement === 'top' ? dHeight : undefined,
            }}
            tabIndex={-1}
          >
            {dHeader}
            <div className={`${dPrefix}drawer__body`}>{children}</div>
            {dFooter}
          </div>
        </DDrawerContext.Provider>
      </DDialog>
      {childDrawer}
    </>
  );

  return dContainer === false ? drawerNode : containerEl && ReactDOM.createPortal(drawerNode, containerEl);
}
