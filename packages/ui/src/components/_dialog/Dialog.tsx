import type { DTransitionProps } from '../_transition';

import React, { useEffect, useCallback, useRef, useImperativeHandle } from 'react';

import { usePrefixConfig, useId, useAsync, useRefCallback } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DTransition } from '../_transition';
import { DMask } from './Mask';

export interface DDialogRef {
  uniqueId: number;
  el: HTMLDivElement | null;
  contentEl: HTMLDivElement | null;
}

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dCallbackList?: NonNullable<DTransitionProps['dCallbackList']>;
  dContentProps?: React.HTMLAttributes<HTMLDivElement>;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dDestroy?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const Dialog: React.ForwardRefRenderFunction<DDialogRef, DDialogProps> = (props, ref) => {
  const {
    dVisible,
    dCallbackList,
    dContentProps,
    dMask = true,
    dMaskClosable = true,
    dDestroy = false,
    onClose,
    afterVisibleChange,
    className,
    style,
    children,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogEl, dialogRef] = useRefCallback<HTMLDivElement>();
  const [dialogContentEl, dialogContentRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const dataRef = useRef<{ preActiveEl: HTMLElement | null }>({
    preActiveEl: null,
  });

  const asyncCapture = useAsync();
  const uniqueId = useId();

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

  useImperativeHandle(
    ref,
    () => ({
      uniqueId,
      el: dialogEl,
      contentEl: dialogContentEl,
    }),
    [dialogContentEl, dialogEl, uniqueId]
  );

  return (
    <DTransition
      dEl={dialogContentEl}
      dVisible={dVisible}
      dCallbackList={{
        ...dCallbackList,
        beforeEnter: (el) => dCallbackList?.beforeEnter(el),
        afterEnter: (el) => {
          dCallbackList?.afterEnter?.(el);
          dataRef.current.preActiveEl = document.activeElement as HTMLElement | null;
          el.focus({ preventScroll: true });
        },
        beforeLeave: (el) => {
          dataRef.current.preActiveEl?.focus({ preventScroll: true });
          return dCallbackList?.beforeLeave(el);
        },
      }}
      dRender={(hidden) =>
        !(dDestroy && hidden) && (
          <div
            {...restProps}
            ref={dialogRef}
            className={getClassName(className, `${dPrefix}dialog`)}
            style={mergeStyle(style, { display: hidden ? 'none' : undefined })}
            role="dialog"
            aria-modal="true"
            aria-describedby={`${dPrefix}dialog-content-${uniqueId}`}
          >
            {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
            <div
              {...dContentProps}
              ref={dialogContentRef}
              id={`${dPrefix}dialog-content-${uniqueId}`}
              className={getClassName(dContentProps?.className, `${dPrefix}dialog__content`)}
              tabIndex={-1}
            >
              {children}
            </div>
          </div>
        )
      }
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    />
  );
};

export const DDialog = React.forwardRef(Dialog);
