import { isUndefined } from 'lodash';
import { useRef } from 'react';
import { useEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';

import { useAsync } from '../../hooks';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DRenderProps {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface DTriggerProps {
  dTrigger?: DTriggerType | DTriggerType[];
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  dTriggerEl?: HTMLElement | null;
  dRender?: (props: DRenderProps) => React.ReactNode;
  onTrigger?: (state?: boolean) => void;
}

export function DTrigger(props: DTriggerProps) {
  const { dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, dTriggerEl, dRender, onTrigger } = props;

  const dataRef = useRef<{ clearTid: (() => void) | null }>({
    clearTid: null,
  });

  const asyncCapture = useAsync();

  //#region DidUpdate
  useEffect(() => {
    if (!isUndefined(dTriggerEl)) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();
      if (dTriggerEl) {
        if (dTrigger === 'hover') {
          asyncGroup.fromEvent(dTriggerEl, 'mouseenter').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                dataRef.current.clearTid = null;
                flushSync(() => onTrigger?.(true));
              }, dMouseEnterDelay);
            },
          });
          asyncGroup.fromEvent(dTriggerEl, 'mouseleave').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              dataRef.current.clearTid = asyncCapture.setTimeout(() => {
                dataRef.current.clearTid = null;
                flushSync(() => onTrigger?.(false));
              }, dMouseLeaveDelay);
            },
          });
        }

        if (dTrigger === 'focus') {
          asyncGroup.fromEvent(dTriggerEl, 'focus').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => onTrigger?.(true));
            },
          });
          asyncGroup.fromEvent(dTriggerEl, 'blur').subscribe({
            next: () => {
              dataRef.current.clearTid = asyncCapture.setTimeout(() => flushSync(() => onTrigger?.(false)), 20);
            },
          });
        }

        if (dTrigger === 'click') {
          asyncGroup.fromEvent(dTriggerEl, 'click').subscribe({
            next: () => {
              dataRef.current.clearTid && dataRef.current.clearTid();
              flushSync(() => onTrigger?.());
            },
          });
        }
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, dTriggerEl, onTrigger]);
  //#endregion

  const renderProps = useMemo<DRenderProps>(() => {
    const _renderProps: DRenderProps = {};
    if (dTrigger === 'hover') {
      _renderProps.onMouseEnter = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          onTrigger?.(true);
        }, dMouseEnterDelay);
      };
      _renderProps.onMouseLeave = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          dataRef.current.clearTid = null;
          onTrigger?.(false);
        }, dMouseLeaveDelay);
      };
    }
    if (dTrigger === 'focus') {
      _renderProps.onFocus = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onTrigger?.(true);
      };
      _renderProps.onBlur = () => {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => onTrigger?.(false), 20);
      };
    }
    if (dTrigger === 'click') {
      _renderProps.onClick = () => {
        dataRef.current.clearTid && dataRef.current.clearTid();
        onTrigger?.();
      };
    }

    return _renderProps;
  }, [asyncCapture, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, onTrigger]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{dRender?.(renderProps)}</>;
}
