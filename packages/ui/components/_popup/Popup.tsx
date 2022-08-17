import { isUndefined } from 'lodash';
import { useEffect, useId, useRef } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import { useAsync, useElement } from '@react-devui/hooks';

import { useLayout, usePrefixConfig } from '../../hooks';

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
  dContainer?: HTMLElement | null;
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
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
    clearClickOut?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const uniqueId = useId();

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const containerEl = useElement(() => {
    if (isUndefined(dContainer)) {
      let el = document.getElementById(`${dPrefix}popup-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}popup-root`;
        document.body.appendChild(el);
      }
      return el;
    }

    return dContainer;
  });

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
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(), dMouseEnterDelay);
          } else {
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(), dMouseLeaveDelay);
          }
          break;

        case 'popup-hover':
          if (!visible) {
            dataRef.current.clearTid = asyncCapture.setTimeout(() => changeVisible(), dMouseLeaveDelay);
          }
          break;

        default:
          break;
      }
    } else {
      changeVisible();
    }
  };

  useEffect(() => {
    if (!dDisabled && dVisible && dTrigger === 'click') {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearClickOut = asyncGroup.requestAnimationFrame(() => {
            handleTrigger(false);
          });
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  });

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
  });

  useEffect(() => {
    if (!dDisabled && dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      const triggerEl = document.querySelector(`[data-popup-triggerid="${uniqueId}"]`) as HTMLElement | null;
      if (triggerEl) {
        asyncGroup.onResize(triggerEl, () => {
          dUpdatePosition?.();
        });
      }

      const popupEl = document.querySelector(`[data-popup-popupid="${uniqueId}"]`) as HTMLElement | null;
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          dUpdatePosition?.();
        });
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dDisabled, dUpdatePosition, dVisible, uniqueId]);

  useEffect(() => {
    if (!dDisabled && dVisible && dContainer) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(dContainer, 'scroll', { passive: true }).subscribe({
        next: () => {
          dUpdatePosition?.();
        },
      });

      asyncGroup.onResize(dContainer, () => {
        dUpdatePosition?.();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dContainer, dDisabled, dUpdatePosition, dVisible]);

  useEffect(() => {
    if (!dDisabled && dVisible && scrollEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(scrollEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          dUpdatePosition?.();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dDisabled, dUpdatePosition, dVisible, scrollEl]);

  useEffect(() => {
    if (!dDisabled && dVisible && resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        dUpdatePosition?.();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dDisabled, dUpdatePosition, dVisible, resizeEl]);

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
      {!dDisabled && containerEl && ReactDOM.createPortal(popupNode, containerEl)}
    </>
  );
}
