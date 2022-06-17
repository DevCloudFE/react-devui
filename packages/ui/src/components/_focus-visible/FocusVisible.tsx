import React, { useEffect, useRef } from 'react';

import { useAsync } from '../../hooks';

const FOCUS_KEY = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'];

export interface DFocusVisibleProps {
  children: React.ReactElement;
  onFocusVisibleChange?: (visible: boolean) => void;
}
export function DFocusVisible(props: DFocusVisibleProps) {
  const { children, onFocusVisibleChange } = props;

  const dataRef = useRef({
    focusByKeydown: false,
    focusVisible: false,
  });

  const asyncCapture = useAsync();

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
      next: () => {
        dataRef.current.focusByKeydown = true;
        asyncGroup.setTimeout(() => {
          dataRef.current.focusByKeydown = false;
        }, 20);
      },
    });

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture]);

  return React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
    ...children.props,
    onFocus: (e) => {
      children.props.onFocus?.(e);

      if (dataRef.current.focusByKeydown) {
        onFocusVisibleChange?.(true);
        dataRef.current.focusVisible = true;
      }
    },
    onBlur: (e) => {
      children.props.onBlur?.(e);

      onFocusVisibleChange?.(false);
      dataRef.current.focusVisible = false;
    },
    onKeyDown: (e) => {
      children.props.onKeyDown?.(e);

      if (!dataRef.current.focusVisible && FOCUS_KEY.includes(e.code)) {
        onFocusVisibleChange?.(true);
      }
    },
  });
}
