import { useEffect, useRef } from 'react';

import { useAsync } from '@react-devui/hooks';

const FOCUS_KEY = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'];

export interface DFocusVisibleRenderProps {
  fvOnFocus: React.FocusEventHandler;
  fvOnBlur: React.FocusEventHandler;
  fvOnKeyDown: React.KeyboardEventHandler;
}

export interface DFocusVisibleProps {
  children: (props: DFocusVisibleRenderProps) => JSX.Element | null;
  onFocusVisibleChange?: (visible: boolean) => void;
}

export function DFocusVisible(props: DFocusVisibleProps): JSX.Element | null {
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

  return children({
    fvOnFocus: () => {
      if (dataRef.current.focusByKeydown) {
        onFocusVisibleChange?.(true);
        dataRef.current.focusVisible = true;
      }
    },
    fvOnBlur: () => {
      onFocusVisibleChange?.(false);
      dataRef.current.focusVisible = false;
    },
    fvOnKeyDown: (e) => {
      if (!dataRef.current.focusVisible && FOCUS_KEY.includes(e.code)) {
        onFocusVisibleChange?.(true);
      }
    },
  });
}
