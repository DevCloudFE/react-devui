import { isUndefined } from 'lodash';
import { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import { useAsync, useEventCallback } from '../../hooks';

export type DExtendsPopupProps = Pick<DPopupProps, 'dDisabled' | 'dTrigger' | 'dMouseEnterDelay' | 'dMouseLeaveDelay' | 'dEscClosable'>;

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
  children: (props: DPopupRenderProps) => JSX.Element | null;
  dVisible: boolean;
  dPopup: (props: DPopupPopupRenderProps) => JSX.Element | null;
  dContainer?: HTMLElement | null;
  dTrigger?: 'hover' | 'focus' | 'click';
  dDisabled?: boolean;
  dEscClosable?: boolean;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  onVisibleChange?: (visible: boolean) => void;
  onUpdate?: () => void;
}

export function DPopup(props: DPopupProps) {
  const {
    children,
    dVisible,
    dPopup,
    dContainer,
    dTrigger = 'hover',
    dDisabled = false,
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
    if (!dDisabled && dVisible && dTrigger === 'click') {
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
  }, [asyncCapture, handleTrigger, dTrigger, dVisible, dDisabled]);

  useEffect(() => {
    if (!dDisabled && dVisible && dEscClosable) {
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
  }, [asyncCapture, handleTrigger, dEscClosable, dVisible, dDisabled]);

  useEffect(() => {
    if (!dDisabled && dVisible) {
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
  }, [asyncCapture, dVisible, onUpdate, uniqueId, dDisabled]);

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
      {!dDisabled && dContainer && ReactDOM.createPortal(popupNode, dContainer)}
    </>
  );
}
