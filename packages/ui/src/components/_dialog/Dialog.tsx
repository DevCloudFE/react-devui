import { useCallback } from 'react';

import { usePrefixConfig } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DMask } from './Mask';

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dHidden: boolean;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dDestroy?: boolean;
  dDialogRef?: React.Ref<HTMLDivElement>;
  onClose?: () => void;
}

export function DDialog(props: DDialogProps) {
  const {
    dVisible,
    dHidden,
    dMask = true,
    dMaskClosable = true,
    dDestroy = false,
    dDialogRef,
    onClose,
    className,
    style,
    children,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const handleMaskClose = useCallback(() => {
    if (dMaskClosable) {
      onClose?.();
    }
  }, [dMaskClosable, onClose]);

  return dDestroy && dHidden ? null : (
    <div
      {...restProps}
      ref={dDialogRef}
      className={getClassName(className, `${dPrefix}dialog`)}
      style={mergeStyle({ display: dHidden ? 'none' : undefined }, style)}
      role="dialog"
      aria-modal="true"
    >
      {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
      {children}
    </div>
  );
}
