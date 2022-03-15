import { useEffect, useRef } from 'react';

import { useAsync } from '../../hooks';

const FOCUS_KEY = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'];

export function useFocusVisible(onFocusVisible?: (visible: boolean) => void): {
  fvOnFocus: () => void;
  fvOnBlur: () => void;
  fvOnKeyDown: React.KeyboardEventHandler;
} {
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

  return {
    fvOnFocus: () => {
      if (dataRef.current.focusByKeydown) {
        onFocusVisible?.(true);
        dataRef.current.focusVisible = true;
      }
    },
    fvOnBlur: () => {
      onFocusVisible?.(false);
      dataRef.current.focusVisible = false;
    },
    fvOnKeyDown: (e) => {
      if (!dataRef.current.focusVisible && FOCUS_KEY.includes(e.code)) {
        onFocusVisible?.(true);
      }
    },
  };
}
