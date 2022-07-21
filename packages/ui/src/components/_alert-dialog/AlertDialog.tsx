import { useRef } from 'react';

import { useAsync, useMount, usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DAlertDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dDuration: number;
  dEscClosable?: boolean;
  dDialogRef?: React.Ref<HTMLDivElement>;
  onClose?: () => void;
}

export function DAlertDialog(props: DAlertDialogProps): JSX.Element | null {
  const {
    children,
    dDuration,
    dEscClosable = true,
    dDialogRef,
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

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

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}alert-dialog`)}
      ref={dDialogRef}
      tabIndex={restProps.tabIndex ?? -1}
      role={restProps.role ?? 'alert'}
      onMouseEnter={(e) => {
        restProps.onMouseEnter?.(e);

        dataRef.current.clearTid?.();
      }}
      onMouseLeave={(e) => {
        restProps.onMouseLeave?.(e);

        if (dDuration > 0) {
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            onClose?.();
          }, dDuration * 1000);
        }
      }}
      onKeyDown={(e) => {
        restProps.onKeyDown?.(e);

        if (dEscClosable && e.code === 'Escape') {
          dataRef.current.clearTid?.();
          onClose?.();
        }
      }}
    >
      {children}
    </div>
  );
}
