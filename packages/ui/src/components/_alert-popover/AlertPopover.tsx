import type { DCloneHTMLElement } from '../../utils/types';

import { useRef } from 'react';

import { useAsync, useMount } from '@react-devui/hooks';

import { cloneHTMLElement } from '../../utils';

export interface DAlertPopoverProps {
  children: (props: { render: DCloneHTMLElement }) => JSX.Element | null;
  dDuration: number;
  dEscClosable: boolean;
  onClose: (() => void) | undefined;
}

export function DAlertPopover(props: DAlertPopoverProps): JSX.Element | null {
  const { children, dDuration, dEscClosable, onClose } = props;

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const async = useAsync();

  useMount(() => {
    if (dDuration > 0) {
      dataRef.current.clearTid = async.setTimeout(() => {
        onClose?.();
      }, dDuration * 1000);
    }
  });

  return children({
    render: (el) =>
      cloneHTMLElement(el, {
        tabIndex: el.props.tabIndex ?? -1,
        role: el.props.role ?? 'alert',
        onMouseEnter: (e) => {
          el.props.onMouseEnter?.(e);

          dataRef.current.clearTid?.();
        },
        onMouseLeave: (e) => {
          el.props.onMouseLeave?.(e);

          if (dDuration > 0) {
            dataRef.current.clearTid = async.setTimeout(() => {
              onClose?.();
            }, dDuration * 1000);
          }
        },
        onKeyDown: (e) => {
          el.props.onKeyDown?.(e);

          if (dEscClosable && e.code === 'Escape') {
            dataRef.current.clearTid?.();
            onClose?.();
          }
        },
      }),
  });
}
