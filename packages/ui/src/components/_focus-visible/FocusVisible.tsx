import type { DCloneHTMLElement } from '../../utils/types';

import { isUndefined } from 'lodash';
import { useRef } from 'react';

import { useAsync, useEvent, useRefExtra } from '@react-devui/hooks';

import { cloneHTMLElement } from '../../utils';

const FOCUS_KEY = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', 'Space'];

export interface DFocusVisibleProps {
  children: (props: { render: DCloneHTMLElement }) => JSX.Element | null;
  dDisabled?: boolean;
  onFocusVisibleChange: (focus: boolean) => void;
}

export function DFocusVisible(props: DFocusVisibleProps): JSX.Element | null {
  const { children, dDisabled = false, onFocusVisibleChange } = props;

  //#region Ref
  const windowRef = useRefExtra(() => window);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

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
    dDisabled
  );

  return children({
    render: (el) =>
      dDisabled
        ? el
        : cloneHTMLElement(el, {
            onFocus: (e) => {
              el.props.onFocus?.(e);

              if (!isUndefined(dataRef.current.clearTid)) {
                onFocusVisibleChange(true);
              }
            },
            onBlur: (e) => {
              el.props.onBlur?.(e);

              onFocusVisibleChange(false);
            },
            onKeyDown: (e) => {
              el.props.onKeyDown?.(e);

              if (FOCUS_KEY.includes(e.code)) {
                onFocusVisibleChange(true);
              }
            },
          }),
  });
}
