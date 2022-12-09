import type { DCloneHTMLElement } from '../../utils/types';
import type React from 'react';

import { isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';
import { fromEvent } from 'rxjs';

import { useAsync, useEvent, useRefExtra, useResize } from '@react-devui/hooks';

import { cloneHTMLElement } from '../../utils';
import { useGlobalScroll, useLayout } from '../root';

export interface DPopupProps {
  children: (props: { renderTrigger: DCloneHTMLElement; renderPopup: DCloneHTMLElement }) => JSX.Element | null;
  dVisible: boolean;
  dTrigger: 'hover' | 'click';
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dUpdatePosition: {
    fn: () => void;
    triggerRef: React.RefObject<HTMLElement>;
    popupRef: React.RefObject<HTMLElement>;
    extraScrollRefs: (React.RefObject<HTMLElement> | undefined)[];
  };
  onVisibleChange: (visible: boolean) => void;
}

export function DPopup(props: DPopupProps): JSX.Element | null {
  const { children, dVisible, dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, dUpdatePosition, onVisibleChange } = props;

  //#region Context
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const windowRef = useRefExtra(() => window);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
    clearClickOut?: () => void;
  }>({});

  const async = useAsync();

  const handleTrigger = (visible?: boolean, behavior?: 'hover' | 'popup-hover') => {
    dataRef.current.clearTid?.();

    const changeVisible = () => {
      if (isUndefined(visible)) {
        onVisibleChange(!dVisible);
      } else if (!Object.is(dVisible, visible)) {
        onVisibleChange(visible);
      }
    };

    if (behavior) {
      switch (behavior) {
        case 'hover':
          if (visible) {
            dataRef.current.clearTid = async.setTimeout(() => changeVisible(), dMouseEnterDelay);
          } else {
            dataRef.current.clearTid = async.setTimeout(() => changeVisible(), dMouseLeaveDelay);
          }
          break;

        case 'popup-hover':
          if (!visible) {
            dataRef.current.clearTid = async.setTimeout(() => changeVisible(), dMouseLeaveDelay);
          }
          break;

        default:
          break;
      }
    } else {
      changeVisible();
    }
  };

  const globalScroll = useGlobalScroll(dUpdatePosition.fn, !dVisible);
  useEffect(() => {
    if (dVisible && !globalScroll) {
      const ob = fromEvent(
        [dPageScrollRef, ...dUpdatePosition.extraScrollRefs].map((ref) => ref?.current).filter((el) => el) as HTMLElement[],
        'scroll',
        { passive: true }
      ).subscribe({
        next: () => {
          dUpdatePosition.fn();
        },
      });
      return () => {
        ob.unsubscribe();
      };
    }
  });

  useResize(dUpdatePosition.triggerRef, dUpdatePosition.fn, !dVisible);
  useResize(dUpdatePosition.popupRef, dUpdatePosition.fn, !dVisible);
  useResize(dContentResizeRef, dUpdatePosition.fn, !dVisible);

  useEvent(
    windowRef,
    'click',
    () => {
      dataRef.current.clearClickOut = async.requestAnimationFrame(() => {
        handleTrigger(false);
      });
    },
    { capture: true },
    !dVisible || dTrigger !== 'click'
  );

  return children({
    renderTrigger: (el) => {
      const triggerProps: React.HTMLAttributes<HTMLElement> = {};
      switch (dTrigger) {
        case 'hover':
          triggerProps.onMouseEnter = (e) => {
            el.props.onMouseEnter?.(e);

            handleTrigger(true, 'hover');
          };
          triggerProps.onMouseLeave = (e) => {
            el.props.onMouseLeave?.(e);

            handleTrigger(false, 'hover');
          };
          break;

        case 'click':
          triggerProps.onClick = (e) => {
            el.props.onClick?.(e);

            dataRef.current.clearClickOut?.();
            handleTrigger();
          };
          break;

        default:
          break;
      }

      return cloneHTMLElement(el, triggerProps);
    },
    renderPopup: (el) => {
      const popupProps: React.HTMLAttributes<HTMLElement> = {};
      if (dVisible) {
        switch (dTrigger) {
          case 'hover':
            popupProps.onMouseEnter = (e) => {
              el.props.onMouseEnter?.(e);

              handleTrigger(true, 'popup-hover');
            };
            popupProps.onMouseLeave = (e) => {
              el.props.onMouseLeave?.(e);

              handleTrigger(false, 'popup-hover');
            };
            break;

          case 'click':
            popupProps.onClick = (e) => {
              el.props.onClick?.(e);

              dataRef.current.clearClickOut?.();
            };
            break;

          default:
            break;
        }
      }

      return cloneHTMLElement(el, popupProps);
    },
  });
}
