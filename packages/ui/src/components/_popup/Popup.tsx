import { isUndefined } from 'lodash';
import { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import { useAsync, useContentScrollViewChange, useEventCallback } from '../../hooks';

export type DExtendsPopupProps = Pick<DPopupProps, 'disabled' | 'dTrigger' | 'dMouseEnterDelay' | 'dMouseLeaveDelay' | 'dEscClosable'>;

export interface DPopupPopupRenderProps {
  'data-popup-popupid': string;
  pOnMouseEnter?: () => void;
  pOnMouseLeave?: () => void;
  pOnClick?: () => void;
}

export interface DPopupRenderProps {
  'data-popup-triggerid': string;
  pOnMouseEnter?: () => void;
  pOnMouseLeave?: () => void;
  pOnFocus?: () => void;
  pOnBlur?: () => void;
  pOnClick?: () => void;
}

export interface DPopupProps {
  disabled?: boolean;
  dVisible: boolean;
  children: (props: DPopupRenderProps) => JSX.Element | null;
  dPopup: (props: DPopupPopupRenderProps) => JSX.Element | null;
  dContainer?: HTMLElement | null;
  dTrigger?: 'hover' | 'focus' | 'click';
  dEscClosable?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  onVisibleChange?: (visible: boolean) => void;
  onUpdate?: () => void;
}

export function DPopup(props: DPopupProps) {
  const {
    disabled,
    children,
    dVisible,
    dPopup,
    dContainer,
    dTrigger = 'hover',
    dEscClosable = true,
    dMouseEnterDelay = 150,
    dMouseLeaveDelay = 200,
    onVisibleChange,
    onUpdate,
  } = props;

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const uniqueId = useId();

  const changeVisible = (visible?: boolean) => {
    if (isUndefined(visible)) {
      onVisibleChange?.(!dVisible);
    } else if (!Object.is(dVisible, visible)) {
      onVisibleChange?.(visible);
    }
  };

  const handleTrigger = useEventCallback((visible?: boolean, behavior?: 'hover' | 'popup-hover') => {
    dataRef.current.clearTid?.();

    if (behavior) {
      switch (behavior) {
        case 'hover':
          if (visible) {
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(visible), dMouseEnterDelay);
          } else {
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(visible), dMouseLeaveDelay);
          }
          break;

        case 'popup-hover':
          if (!visible) {
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(visible), dMouseLeaveDelay);
          }
          break;

        default:
          break;
      }
    } else {
      changeVisible(visible);
    }
  });

  const clickOut = useRef(true);
  useEffect(() => {
    if (!disabled && dVisible && dTrigger === 'click') {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(window, 'click').subscribe({
        next: () => {
          if (clickOut.current) {
            handleTrigger(false);
          }
          clickOut.current = true;
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, handleTrigger, dTrigger, dVisible, disabled]);

  useEffect(() => {
    if (!disabled && dVisible && dEscClosable) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            handleTrigger(false);
          },
        });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, handleTrigger, dEscClosable, dVisible, disabled]);

  useContentScrollViewChange(!disabled && dVisible ? onUpdate : undefined);
  useEffect(() => {
    if (!disabled && dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      const triggerEl = document.querySelector(`[data-popup-triggerid="${uniqueId}"]`) as HTMLElement | null;
      if (triggerEl) {
        asyncGroup.onResize(triggerEl, () => {
          onUpdate?.();
        });
      }

      const popupEl = document.querySelector(`[data-popup-popupid="${uniqueId}"]`) as HTMLElement | null;
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          onUpdate?.();
        });
      }

      asyncGroup.onGlobalScroll(() => {
        onUpdate?.();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, disabled, dVisible, onUpdate, uniqueId]);

  const childProps: DPopupRenderProps = { 'data-popup-triggerid': uniqueId };
  if (!disabled) {
    switch (dTrigger) {
      case 'hover':
        childProps.pOnMouseEnter = () => {
          handleTrigger(true, 'hover');
        };
        childProps.pOnMouseLeave = () => {
          handleTrigger(false, 'hover');
        };
        break;

      case 'focus':
        childProps.pOnFocus = () => {
          handleTrigger(true);
        };
        childProps.pOnBlur = () => {
          handleTrigger(false);
        };
        break;

      case 'click':
        childProps.pOnClick = () => {
          clickOut.current = false;
          handleTrigger();
        };
        break;

      default:
        break;
    }
  }
  const child = children(childProps);

  const popupProps: DPopupPopupRenderProps = { 'data-popup-popupid': uniqueId };
  if (!disabled && dVisible) {
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
          clickOut.current = false;
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
      {!disabled && dContainer && ReactDOM.createPortal(popupNode, dContainer)}
    </>
  );
}
