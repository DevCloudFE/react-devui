import { isUndefined } from 'lodash';
import { useRef } from 'react';

import { useAsync, useEvent } from '@react-devui/hooks';

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

  const dataRef = useRef<{
    clearTid?: () => void;
    focusVisible: boolean;
  }>({
    focusVisible: false,
  });

  const async = useAsync();
  useEvent(window, 'keydown', () => {
    dataRef.current.clearTid?.();
    dataRef.current.clearTid = async.setTimeout(() => {
      dataRef.current.clearTid = undefined;
    }, 20);
  });

  return children({
    fvOnFocus: () => {
      if (!isUndefined(dataRef.current.clearTid)) {
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
