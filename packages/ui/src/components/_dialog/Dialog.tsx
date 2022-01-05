import { useEffect, useCallback } from 'react';

import { usePrefixConfig, useAsync } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DMask } from './Mask';

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dHidden: boolean;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dEscClosable?: boolean;
  dDestroy?: boolean;
  dDialogRef?: React.LegacyRef<HTMLDivElement>;
  onClose?: () => void;
}

export function DDialog(props: DDialogProps) {
  const {
    dVisible,
    dHidden,
    dMask = true,
    dMaskClosable = true,
    dEscClosable = true,
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

  const asyncCapture = useAsync();

  const handleMaskClose = useCallback(() => {
    if (dMaskClosable) {
      onClose?.();
    }
  }, [dMaskClosable, onClose]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible && dEscClosable) {
      asyncGroup.onEscKeydown(() => onClose?.());
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dEscClosable, dVisible, onClose]);

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {!(dDestroy && dHidden) && (
        <div
          {...restProps}
          ref={dDialogRef}
          className={getClassName(className, `${dPrefix}dialog`)}
          style={mergeStyle(style, { display: dHidden ? 'none' : undefined })}
          role="dialog"
          aria-modal="true"
        >
          {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
          {children}
        </div>
      )}
    </>
  );
}
