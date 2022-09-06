import { isUndefined } from 'lodash';
import { useId, useRef } from 'react';
import ReactDOM from 'react-dom';

import { useAsync, useElement, useEvent, useResize } from '@react-devui/hooks';

import { useLayout } from '../../hooks';

export interface DPopupPopupRenderProps {
  'data-popup-popupid': string;
  pOnMouseEnter?: React.MouseEventHandler;
  pOnMouseLeave?: React.MouseEventHandler;
  pOnClick?: React.MouseEventHandler;
}

export interface DPopupRenderProps {
  'data-popup-triggerid': string;
  pOnMouseEnter?: React.MouseEventHandler;
  pOnMouseLeave?: React.MouseEventHandler;
  pOnClick?: React.MouseEventHandler;
}

export interface DPopupProps {
  children: (props: DPopupRenderProps) => JSX.Element | null;
  dPopup: (props: DPopupPopupRenderProps) => JSX.Element | null;
  dVisible?: boolean;
  dContainer: HTMLElement | null;
  dTrigger?: 'hover' | 'click';
  dDisabled?: boolean;
  dEscClosable?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dUpdatePosition?: () => void;
  onVisibleChange?: (visible: boolean) => void;
}

export function DPopup(props: DPopupProps): JSX.Element | null {
  const {
    children,
    dPopup,
    dVisible = false,
    dContainer,
    dTrigger = 'hover',
    dDisabled = false,
    dEscClosable = true,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    dUpdatePosition,
    onVisibleChange,
  } = props;

  //#region Context
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
    clearClickOut?: () => void;
  }>({});

  const async = useAsync();

  const uniqueId = useId();

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const triggerEl = useElement(`[data-popup-triggerid="${uniqueId}"]`);
  const popupEl = useElement(`[data-popup-popupid="${uniqueId}"]`);

  const handleTrigger = (visible?: boolean, behavior?: 'hover' | 'popup-hover') => {
    dataRef.current.clearTid?.();

    const changeVisible = () => {
      if (isUndefined(visible)) {
        onVisibleChange?.(!dVisible);
      } else if (!Object.is(dVisible, visible)) {
        onVisibleChange?.(visible);
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

  useEvent(
    window,
    'click',
    () => {
      if (!dDisabled && dVisible && dTrigger === 'click') {
        dataRef.current.clearClickOut = async.requestAnimationFrame(() => {
          handleTrigger(false);
        });
      }
    },
    { capture: true }
  );

  useEvent<KeyboardEvent>(window, 'keydown', (e) => {
    if (!dDisabled && dVisible && dEscClosable && e.code === 'Escape') {
      handleTrigger(false);
    }
  });

  const updatePosition = () => {
    if (!dDisabled && dVisible) {
      dUpdatePosition?.();
    }
  };
  useResize(triggerEl, updatePosition);
  useResize(popupEl, updatePosition);
  useResize(dContainer, updatePosition);
  useResize(resizeEl, updatePosition);
  useEvent(dContainer, 'scroll', updatePosition, { passive: true });
  useEvent(scrollEl, 'scroll', updatePosition, { passive: true });

  const childProps: DPopupRenderProps = { 'data-popup-triggerid': uniqueId };
  if (!dDisabled) {
    switch (dTrigger) {
      case 'hover':
        childProps.pOnMouseEnter = () => {
          handleTrigger(true, 'hover');
        };
        childProps.pOnMouseLeave = () => {
          handleTrigger(false, 'hover');
        };
        break;

      case 'click':
        childProps.pOnClick = () => {
          dataRef.current.clearClickOut?.();
          handleTrigger();
        };
        break;

      default:
        break;
    }
  }
  const child = children(childProps);

  const popupProps: DPopupPopupRenderProps = { 'data-popup-popupid': uniqueId };
  if (!dDisabled && dVisible) {
    switch (dTrigger) {
      case 'hover':
        popupProps.pOnMouseEnter = () => {
          handleTrigger(true, 'popup-hover');
        };
        popupProps.pOnMouseLeave = () => {
          handleTrigger(false, 'popup-hover');
        };
        break;

      case 'click':
        popupProps.pOnClick = () => {
          dataRef.current.clearClickOut?.();
        };
        break;

      default:
        break;
    }
  }
  const popupNode = dPopup(popupProps);

  return (
    <>
      {child}
      {!dDisabled && dContainer && ReactDOM.createPortal(popupNode, dContainer)}
    </>
  );
}
