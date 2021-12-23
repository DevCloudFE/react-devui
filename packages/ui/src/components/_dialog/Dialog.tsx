import { useEffect, useCallback } from 'react';

import { usePrefixConfig, useAsync } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DMask } from './Mask';

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dId: string;
  dVisible: boolean;
  dHidden: boolean;
  dContentProps?: React.HTMLAttributes<HTMLDivElement>;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dDestroy?: boolean;
  dDialogRef?: React.LegacyRef<HTMLDivElement>;
  dDialogContentRef?: React.LegacyRef<HTMLDivElement>;
  onClose?: () => void;
}

export function DDialog(props: DDialogProps) {
  const {
    dId,
    dVisible,
    dHidden,
    dContentProps,
    dMask = true,
    dMaskClosable = true,
    dDestroy = false,
    dDialogRef,
    dDialogContentRef,
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

  //#region DidUpdate
  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (dVisible) {
      asyncGroup.onEscKeydown(() => onClose?.());
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dVisible, onClose]);
  //#endregion

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
          aria-describedby={`${dPrefix}dialog-content-${dId}`}
        >
          {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
          <div
            {...dContentProps}
            ref={dDialogContentRef}
            id={`${dPrefix}dialog-content-${dId}`}
            className={getClassName(dContentProps?.className, `${dPrefix}dialog__content`)}
            tabIndex={-1}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}
