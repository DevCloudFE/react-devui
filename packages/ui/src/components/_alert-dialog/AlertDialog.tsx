import { useCallback, useEffect, useRef } from 'react';

import { useAsync, usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DAlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dHidden: boolean;
  dDuration: number;
  dEscClosable: boolean;
  dDialogRef?: React.Ref<HTMLDivElement>;
  onClose?: () => void;
}

export function DAlertDialog(props: DAlertDialogProps) {
  const {
    dHidden,
    dDuration,
    dEscClosable = true,
    dDialogRef,
    onClose,
    children,
    className,
    tabIndex = -1,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const handleMouseEnter = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      onMouseEnter?.(e);

      dataRef.current.clearTid?.();
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      onMouseLeave?.(e);

      if (dDuration > 0) {
        dataRef.current.clearTid?.();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          onClose?.();
        }, dDuration * 1000);
      }
    },
    [asyncCapture, dDuration, onClose, onMouseLeave]
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      onKeyDown?.(e);

      if (dEscClosable && e.code === 'Escape') {
        onClose?.();
      }
    },
    [dEscClosable, onClose, onKeyDown]
  );

  useEffect(() => {
    if (dDuration > 0) {
      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        onClose?.();
      }, dDuration * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return dHidden ? null : (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}alert-dialog`)}
      ref={dDialogRef}
      role="alertdialog"
      tabIndex={tabIndex}
      aria-modal="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
