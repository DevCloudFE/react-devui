import type { DCloneHTMLElement } from '../utils/types';

import { isUndefined } from 'lodash';
import { useRef, useState } from 'react';

import { useAsync, useEvent, useRefExtra } from '@react-devui/hooks';

import { cloneHTMLElement } from '../utils';

const FOCUS_KEY = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'];

export function useFocusVisible(disabled = false): [boolean, DCloneHTMLElement] {
  const windowRef = useRefExtra(() => window);

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const [focusVisible, setFocusVisible] = useState(false);

  const async = useAsync();
  useEvent(
    windowRef,
    'keydown',
    () => {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = async.setTimeout(() => {
        dataRef.current.clearTid = undefined;
      }, 20);
    },
    {},
    disabled
  );

  return [
    focusVisible,
    (el) =>
      disabled
        ? el
        : cloneHTMLElement(el, {
            onFocus: (e) => {
              el.props.onFocus?.(e);

              if (!isUndefined(dataRef.current.clearTid)) {
                setFocusVisible(true);
              }
            },
            onBlur: (e) => {
              el.props.onBlur?.(e);

              setFocusVisible(false);
            },
            onKeyDown: (e) => {
              el.props.onKeyDown?.(e);

              if (FOCUS_KEY.includes(e.code)) {
                setFocusVisible(true);
              }
            },
          }),
  ];
}
