import type { Updater } from '../../hooks/immer';
import type { DTransitionProps } from '../_transition';

import { isFunction, isUndefined } from 'lodash';
import React, { useEffect, useCallback, useRef, useImperativeHandle } from 'react';

import { usePrefixConfig, useLockScroll, useId, useAsync, useImmer, useRefCallback } from '../../hooks';
import { getClassName, MAX_INDEX_MANAGER, mergeStyle } from '../../utils';
import { DTransition } from '../_transition';
import { DMask } from './Mask';

export interface DDialogRef {
  id: number;
  el: HTMLDivElement | null;
  contentEl: HTMLDivElement | null;
  closeDialog: () => void;
}

export interface DDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, Updater<boolean>?];
  dStateList: NonNullable<DTransitionProps['dStateList']>;
  dCallbackList?: NonNullable<DTransitionProps['dCallbackList']>;
  dContentProps?: React.HTMLAttributes<HTMLDivElement>;
  dLockScroll?: boolean;
  dZIndex?: number;
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
    dLockScroll,
    dZIndex,
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
  const [zIndex, setZIndex] = useImmer<string | number>(1000);

  const [visible, setVisible] = dVisible;

  const handleMaskClose = useCallback(() => {
    if (dMaskClosable) {
      setVisible?.(false);
      onClose?.();
    }
  }, [dMaskClosable, onClose, setVisible]);

  const closeDialog = useCallback(() => {
    setVisible?.(false);
    onClose?.();
  }, [onClose, setVisible]);

  useLockScroll(dLockScroll ?? visible);

  //#region DidUpdate
  useEffect(() => {
    if (visible) {
      if (isUndefined(dZIndex)) {
        const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
        setZIndex(maxZIndex);
        return () => {
          MAX_INDEX_MANAGER.deleteRecord(key);
        };
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [dPrefix, dZIndex, setZIndex, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (visible) {
      asyncGroup.onEscKeydown(closeDialog);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, closeDialog, id, visible]);
  //#endregion

  useImperativeHandle(
    ref,
    () => ({
      id,
      el: dialogEl,
      contentEl: dialogContentEl,
      closeDialog,
    }),
    [closeDialog, dialogContentEl, dialogEl, id]
  );

  return (
    <DTransition
      dEl={dialogContentEl}
      dVisible={visible}
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
            style={mergeStyle(style, {
              display: hidden ? 'none' : undefined,
              zIndex,
            })}
            role="dialog"
            aria-modal="true"
            aria-describedby={`${dPrefix}dialog-content-${id}`}
          >
            {dMask && <DMask dVisible={visible} onClose={handleMaskClose} />}
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
