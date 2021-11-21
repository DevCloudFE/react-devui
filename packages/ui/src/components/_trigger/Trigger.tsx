import React, { useMemo, useState } from 'react';

import { useAsync } from '../../hooks';

export type DTriggerType = 'hover' | 'focus' | 'click';

export interface DTriggerProps {
  dTrigger?: DTriggerType | DTriggerType[];
  dMouseEnterDelay?: number;
  dMouseLeaveDelay?: number;
  children: React.ReactNode;
  onTrigger?: (state?: boolean) => void;
}

export function DTrigger(props: DTriggerProps) {
  const { dTrigger, dMouseEnterDelay = 150, dMouseLeaveDelay = 200, children, onTrigger } = props;

  const [currentData] = useState<{ tid: number | null }>({
    tid: null,
  });

  const asyncCapture = useAsync();

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement<React.HTMLAttributes<HTMLElement>>(_child, {
      ..._child.props,
      onMouseEnter: (e) => {
        _child.props.onMouseEnter?.(e);

        if (dTrigger === 'hover') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          currentData.tid = asyncCapture.setTimeout(() => {
            currentData.tid = null;
            onTrigger?.(true);
          }, dMouseEnterDelay);
        }
      },
      onMouseLeave: (e) => {
        _child.props.onMouseLeave?.(e);

        if (dTrigger === 'hover') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          currentData.tid = asyncCapture.setTimeout(() => {
            currentData.tid = null;
            onTrigger?.(false);
          }, dMouseLeaveDelay);
        }
      },
      onFocus: (e) => {
        _child.props.onFocus?.(e);

        if (dTrigger === 'focus') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          onTrigger?.(true);
        }
      },
      onBlur: (e) => {
        _child.props.onBlur?.(e);

        if (dTrigger === 'focus') {
          currentData.tid = asyncCapture.setTimeout(() => onTrigger?.(false), 20);
        }
      },
      onClick: (e) => {
        _child.props.onClick?.(e);

        if (dTrigger === 'click') {
          currentData.tid && asyncCapture.clearTimeout(currentData.tid);
          onTrigger?.();
        }
      },
    });
  }, [asyncCapture, children, currentData, dMouseEnterDelay, dMouseLeaveDelay, dTrigger, onTrigger]);

  return child;
}
