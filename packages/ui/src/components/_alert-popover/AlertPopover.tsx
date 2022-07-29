import React from 'react';
import { useRef } from 'react';

import { useAsync, useMount } from '../../hooks';

export interface DAlertPopoverProps {
  children: React.ReactElement;
  dDuration: number;
  dEscClosable?: boolean;
  onClose?: () => void;
}

export function DAlertPopover(props: DAlertPopoverProps): JSX.Element | null {
  const { children, dDuration, dEscClosable = true, onClose } = props;

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  useMount(() => {
    if (dDuration > 0) {
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        onClose?.();
      }, dDuration * 1000);
    }
  });

  return React.cloneElement<React.HTMLAttributes<HTMLDivElement>>(children, {
    ...children.props,
    tabIndex: children.props.tabIndex ?? -1,
    role: children.props.role ?? 'alert',
    onMouseEnter: (e) => {
      children.props.onMouseEnter?.(e);

      dataRef.current.clearTid?.();
    },
    onMouseLeave: (e) => {
      children.props.onMouseLeave?.(e);

      if (dDuration > 0) {
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          onClose?.();
        }, dDuration * 1000);
      }
    },
    onKeyDown: (e) => {
      children.props.onKeyDown?.(e);

      if (dEscClosable && e.code === 'Escape') {
        dataRef.current.clearTid?.();
        onClose?.();
      }
    },
  });
}
