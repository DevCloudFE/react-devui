import { useRef } from 'react';

import { useAsync, useMount, usePrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';

export interface DAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  dClassNamePrefix: string;
  dDuration: number;
  dEscClosable?: boolean;
  dAlertRef?: React.Ref<HTMLDivElement>;
  onClose?: () => void;
}

export function DAlert(props: DAlertProps): JSX.Element | null {
  const {
    children,
    dClassNamePrefix,
    dDuration,
    dEscClosable = true,
    dAlertRef,
    onClose,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const prefix = `${dPrefix}${dClassNamePrefix}`;

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
      className={getClassName(restProps.className, prefix)}
      ref={dAlertRef}
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
