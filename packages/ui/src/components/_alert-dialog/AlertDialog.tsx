import { useCallback, useEffect, useRef } from 'react';

import { useAsync } from '../../hooks';

export interface DAlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dHidden: boolean;
  dDuration: number;
  dDialogRef?: React.LegacyRef<HTMLDivElement>;
  onClose?: () => void;
}

export function DAlertDialog(props: DAlertDialogProps) {
  const { dHidden, dDuration, dDialogRef, onClose, children, onMouseEnter, onMouseLeave, ...restProps } = props;

  const dataRef = useRef<{ clearTid: (() => void) | null }>({
    clearTid: null,
  });

  const asyncCapture = useAsync();

  const handleMouseEnter = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      onMouseEnter?.(e);

      dataRef.current.clearTid && dataRef.current.clearTid();
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      onMouseLeave?.(e);

      if (dDuration > 0) {
        dataRef.current.clearTid && dataRef.current.clearTid();
        dataRef.current.clearTid = asyncCapture.setTimeout(() => {
          onClose?.();
        }, dDuration * 1000);
      }
    },
    [asyncCapture, dDuration, onClose, onMouseLeave]
  );

  useEffect(() => {
    if (dDuration > 0) {
      dataRef.current.clearTid && dataRef.current.clearTid();
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        onClose?.();
      }, dDuration * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return dHidden ? null : (
    <div
      {...restProps}
      ref={dDialogRef}
      role="alertdialog"
      aria-modal="true"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
