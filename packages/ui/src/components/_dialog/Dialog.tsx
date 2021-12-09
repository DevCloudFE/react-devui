import type { DTransitionProps } from '../_transition';

import { isFunction } from 'lodash';
import React, { useEffect, useCallback, useRef, useImperativeHandle } from 'react';

import { usePrefixConfig, useId, useAsync, useRefCallback } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';
import { DTransition } from '../_transition';
import { DMask } from './Mask';

export interface DDialogRef {
  id: number;
  el: HTMLDivElement | null;
  contentEl: HTMLDivElement | null;
}

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dStateList: NonNullable<DTransitionProps['dStateList']>;
  dCallbackList?: NonNullable<DTransitionProps['dCallbackList']>;
  dContentProps?: React.HTMLAttributes<HTMLDivElement>;
  dMask?: boolean;
  dMaskClosable?: boolean;
  dDestroy?: boolean;
  onClose?: () => void;
}

export const DDialog = React.forwardRef<DDialogRef, DDialogProps>((props, ref) => {
  const {
    dVisible,
    dStateList,
    dCallbackList,
    dContentProps,
    dMask = true,
    dMaskClosable = true,
    dDestroy = false,
    onClose,
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
  const id = useId();

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
      id,
      el: dialogEl,
      contentEl: dialogContentEl,
    }),
    [dialogContentEl, dialogEl, id]
  );

  return (
    <DTransition
      dEl={dialogContentEl}
      dVisible={dVisible}
      dStateList={dStateList}
      dCallbackList={() => {
        const callbackList = isFunction(dCallbackList) ? dCallbackList() : dCallbackList;
        return {
          ...callbackList,
          afterEnter: () => {
            callbackList?.afterEnter?.();
            if (dialogContentEl) {
              dataRef.current.preActiveEl = document.activeElement as HTMLElement | null;
              dialogContentEl.focus({ preventScroll: true });
            }
          },
          beforeLeave: () => {
            callbackList?.beforeLeave?.();
            dataRef.current.preActiveEl?.focus({ preventScroll: true });
          },
        };
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
            aria-describedby={`${dPrefix}dialog-content-${id}`}
          >
            {dMask && <DMask dVisible={dVisible} onClose={handleMaskClose} />}
            <div
              {...dContentProps}
              ref={dialogContentRef}
              id={`${dPrefix}dialog-content-${id}`}
              className={getClassName(dContentProps?.className, `${dPrefix}dialog__content`)}
              tabIndex={-1}
            >
              {children}
            </div>
          </div>
        )
      }
    />
  );
});
