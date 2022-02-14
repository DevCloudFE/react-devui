import { isUndefined } from 'lodash';
import { useRef } from 'react';
import { useEffect } from 'react';

import { useAsync, useEventCallback } from '../../hooks';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DRenderProps {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface DTriggerProps {
  dTrigger?: DTriggerType;
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dTriggerEl?: HTMLElement | null;
  dRender?: (props: DRenderProps) => React.ReactNode;
  onTrigger?: (state?: boolean) => void;
}

export function DTrigger(props: DTriggerProps): JSX.Element | null {
  const { dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, dTriggerEl, dRender, onTrigger } = props;

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const changeState = useEventCallback((state?: boolean) => {
    onTrigger?.(state);
  });

  useEffect(() => {
    if (!isUndefined(dTriggerEl)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (dTriggerEl) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(dTriggerEl, 'mouseenter').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                changeState(true);
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(dTriggerEl, 'mouseleave').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                changeState(false);
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(dTriggerEl, 'focus').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              changeState(true);
            },
          });
          asyncGroup.fromEvent(dTriggerEl, 'blur').subscribe({
            next: () => {
              dataRef.current.clearTid = asyncCapture.setTimeout(() => changeState(false), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(dTriggerEl, 'click').subscribe({
            next: () => {
              dataRef.current.clearTid?.();
              changeState();
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, changeState, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl]);

  const renderProps = (() => {
    const renderProps: DRenderProps = {};
    if (dTrigger === 'hover') {
      renderProps.onMouseEnter = () => {
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          onTrigger?.(true);
        }, dMouseEnterDelay);
      };
      renderProps.onMouseLeave = () => {
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          onTrigger?.(false);
        }, dMouseLeaveDelay);
      };
    }
    if (dTrigger === 'focus') {
      renderProps.onFocus = () => {
        dataRef.current.clearTid?.();
        onTrigger?.(true);
      };
      renderProps.onBlur = () => {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => onTrigger?.(false), 20);
      };
    }
    if (dTrigger === 'click') {
      renderProps.onClick = () => {
        dataRef.current.clearTid?.();
        onTrigger?.();
      };
    }

    return renderProps;
  })();

  return (dRender?.(renderProps) as React.ReactElement) ?? null;
}
