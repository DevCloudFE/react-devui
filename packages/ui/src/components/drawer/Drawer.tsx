import type { DTransitionState } from '../_transition';
import type { DDrawerFooterPrivateProps } from './DrawerFooter';
import type { DDrawerHeaderPrivateProps } from './DrawerHeader';
import type { DRefExtra } from '@react-devui/hooks/useRefExtra';

import { isString, isUndefined } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useId, useLockScroll, useRefExtra } from '@react-devui/hooks';
import { getClassName, toPx } from '@react-devui/utils';

import { useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, handleModalKeyDown, TTANSITION_DURING_BASE, checkNoExpandedEl } from '../../utils';
import { DMask } from '../_mask';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DDrawerFooter } from './DrawerFooter';
import { DDrawerHeader } from './DrawerHeader';

export interface DDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dContainer?: DRefExtra | false;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dWidth?: number | string;
  dHeight?: number | string;
  dZIndex?: number | string;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dSkipFirstTransition?: boolean;
  dDestroyAfterClose?: boolean;
  dHeader?: React.ReactElement | string;
  dFooter?: React.ReactElement;
  dChildDrawer?: React.ReactElement;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export interface DDrawerPrivateProps {
  __zIndex?: number | string;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawer' as const });
export const DDrawer: {
  (props: DDrawerProps): JSX.Element | null;
  Header: typeof DDrawerHeader;
  Footer: typeof DDrawerFooter;
} = (props) => {
  const {
    children,
    dVisible,
    dContainer,
    dPlacement = 'right',
    dWidth = 400,
    dHeight = 280,
    dZIndex,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
    dSkipFirstTransition = true,
    dDestroyAfterClose = true,
    dHeader,
    dFooter,
    dChildDrawer,
    onClose,
    afterVisibleChange,
    __zIndex,
    __onVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerProps & DDrawerPrivateProps);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const drawerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRefExtra(
    isUndefined(dContainer)
      ? () => {
          let el = document.getElementById(`${dPrefix}drawer-root`);
          if (!el) {
            el = document.createElement('div');
            el.id = `${dPrefix}drawer-root`;
            document.body.appendChild(el);
          }
          return el;
        }
      : dContainer === false
      ? () => {
          return drawerRef.current?.parentElement ?? null;
        }
      : dContainer,
    true
  );
  //#endregion

  const dataRef = useRef<{
    prevActiveEl: HTMLElement | null;
  }>({
    prevActiveEl: null,
  });

  const uniqueId = useId();
  const titleId = `${dPrefix}drawer-title-${uniqueId}`;
  const bodyId = `${dPrefix}drawer-content-${uniqueId}`;

  const [distance, setDistance] = useState<{ visible: boolean; top: number; right: number; bottom: number; left: number }>({
    visible: false,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const nestedStyle = {
    transition: `transform 140ms ${distance.visible ? 'ease-out' : 'ease-in'} 60ms`,
    transform:
      dPlacement === 'top'
        ? `translateY(${(distance[dPlacement] / 3) * 2}px)`
        : dPlacement === 'right'
        ? `translateX(${-(distance[dPlacement] / 3) * 2}px)`
        : dPlacement === 'bottom'
        ? `translateY(${-(distance[dPlacement] / 3) * 2}px)`
        : `translateX(${(distance[dPlacement] / 3) * 2}px)`,
  };

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onClose);

  const isFixed = isUndefined(dContainer);

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
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
  })();

  useLockScroll(isFixed && visible);

  useEffect(() => {
    if (visible) {
      const height = isString(dHeight) ? toPx(dHeight, true) : dHeight;
      const width = isString(dWidth) ? toPx(dWidth, true) : dWidth;
      __onVisibleChange?.({
        visible: true,
        top: distance.top + (dPlacement === 'top' ? height : 0),
        right: distance.right + (dPlacement === 'right' ? width : 0),
        bottom: distance.bottom + (dPlacement === 'bottom' ? height : 0),
        left: distance.left + (dPlacement === 'left' ? width : 0),
      });
    } else {
      __onVisibleChange?.({
        ...distance,
        visible: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = (() => {
    const transform =
      dPlacement === 'top'
        ? 'translate(0, -100%)'
        : dPlacement === 'right'
        ? 'translate(100%, 0)'
        : dPlacement === 'bottom'
        ? 'translate(0, 100%)'
        : 'translate(-100%, 0)';

    return {
      enter: { transform },
      entering: {
        transition: ['transform'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
      },
      leaving: {
        transform,
        transition: ['transform'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
      },
      leaved: { transform },
    };
  })();

  const childDrawer = (() => {
    if (dChildDrawer) {
      return React.cloneElement<DDrawerPrivateProps>(dChildDrawer, {
        __zIndex: isUndefined(zIndex) ? zIndex : `calc(${zIndex} + 1)`,
        __onVisibleChange: (distance) => {
          setDistance(distance);
        },
      });
    }
    return null;
  })();

  const headerNode = (() => {
    if (dHeader) {
      const node = isString(dHeader) ? <DDrawerHeader>{dHeader}</DDrawerHeader> : dHeader;
      return React.cloneElement<DDrawerHeaderPrivateProps>(node, {
        __id: titleId,
        __onClose: () => {
          changeVisible(false);
        },
      });
    }
  })();

  const drawerNode = (
    <>
      <DTransition
        dIn={visible}
        dDuring={TTANSITION_DURING_BASE}
        dSkipFirstTransition={dSkipFirstTransition}
        dDestroyWhenLeaved={dDestroyAfterClose}
        afterEnter={() => {
          afterVisibleChange?.(true);

          dataRef.current.prevActiveEl = document.activeElement as HTMLElement | null;
          if (drawerRef.current) {
            drawerRef.current.focus({ preventScroll: true });
          }
        }}
        afterLeave={() => {
          afterVisibleChange?.(false);

          if (dataRef.current.prevActiveEl) {
            dataRef.current.prevActiveEl.focus({ preventScroll: true });
          }
        }}
      >
        {(state) => (
          <div
            {...restProps}
            ref={drawerRef}
            className={getClassName(restProps.className, `${dPrefix}drawer`)}
            style={{
              ...restProps.style,
              ...nestedStyle,
              display: state === 'leaved' ? 'none' : undefined,
              position: isFixed ? undefined : 'absolute',
              zIndex,
            }}
            tabIndex={restProps.tabIndex ?? -1}
            role="dialog"
            aria-modal
            aria-labelledby={headerNode ? titleId : undefined}
            aria-describedby={bodyId}
            onKeyDown={(e) => {
              restProps.onKeyDown?.(e);

              if (dEscClosable && checkNoExpandedEl(e.currentTarget) && e.code === 'Escape') {
                changeVisible(false);
              }

              handleModalKeyDown(e);
            }}
          >
            {dMask && (
              <DMask
                dVisible={visible}
                onClose={() => {
                  if (dMaskClosable) {
                    changeVisible(false);
                  }
                }}
              />
            )}
            <div
              className={getClassName(`${dPrefix}drawer__content`, `${dPrefix}drawer__content--${dPlacement}`)}
              style={{
                width: dPlacement === 'left' || dPlacement === 'right' ? dWidth : undefined,
                height: dPlacement === 'bottom' || dPlacement === 'top' ? dHeight : undefined,
                ...transitionStyles[state],
              }}
            >
              {headerNode}
              <div id={bodyId} className={`${dPrefix}drawer__body`}>
                {children}
              </div>
              {dFooter &&
                React.cloneElement<DDrawerFooterPrivateProps>(dFooter, {
                  __onClose: () => {
                    changeVisible(false);
                  },
                })}
            </div>
          </div>
        )}
      </DTransition>
      {childDrawer}
    </>
  );

  return dContainer === false ? drawerNode : containerRef.current && ReactDOM.createPortal(drawerNode, containerRef.current);
};

DDrawer.Header = DDrawerHeader;
DDrawer.Footer = DDrawerFooter;
