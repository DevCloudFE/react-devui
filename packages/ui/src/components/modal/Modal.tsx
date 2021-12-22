import type { DElementSelector } from '../../hooks/element-ref';
import type { Updater } from '../../hooks/immer';
import type { DDialogRef } from '../_dialog';

import { isUndefined, toNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { usePrefixConfig, useComponentConfig, useRefCallback, useImmer, useRefSelector } from '../../hooks';
import { getClassName, MAX_INDEX_MANAGER, mergeStyle } from '../../utils';
import { DDialog } from '../_dialog';

export interface DModalContextData {
  modalId?: number;
  closeModal?: () => void;
}
export const DModalContext = React.createContext<DModalContextData | null>(null);

export interface DModalProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: [boolean, Updater<boolean>?];
  dContainer?: DElementSelector | false;
  dWidth?: string | number;
  dZIndex?: number;
  dMask?: boolean;
  /**if click mask close the modal */
  dMaskClosable?: boolean;
  dHeader?: React.ReactNode;
  dFooter?: React.ReactNode;
  dAfterClose?: () => void;
  dChildModal?: React.ReactNode;
  __onVisibleChange?: (distance: { visible: boolean; top: number; right: number; bottom: number; left: number }) => void;
  __zIndex?: number;
}

export function DModal(props: DModalProps) {
  const {
    dVisible,
    dContainer,
    dWidth = 520,
    dZIndex,
    dMaskClosable,
    dHeader,
    dFooter,
    style,
    dAfterClose,
    dMask = true,
    // __onVisibleChange,
    __zIndex,
    children,
    dChildModal,
    className,
    ...restProps
  } = useComponentConfig(DModal.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogRefContent, dialogRef] = useRefCallback<DDialogRef>();
  //#endregion

  const [zIndex, setZIndex] = useImmer(1000);

  const [visible, setVisible] = dVisible;
  const isFixed = isUndefined(dContainer);
  const handleContainer = useCallback(() => {
    if (isFixed) {
      let el = document.getElementById(`${dPrefix}modal-root`);
      if (!el) {
        el = document.createElement('div');
        el.id = `${dPrefix}modal-root`;
        document.body.appendChild(el);
      }
      return el;
    } else if (dContainer === false) {
      return dialogRefContent?.el?.parentElement ?? null;
    }
    return null;
  }, [dContainer, dPrefix, dialogRefContent?.el?.parentElement, isFixed]);
  const containerRef = useRefSelector(dContainer, handleContainer);

  //#region DidUpdate
  useEffect(() => {
    if (visible) {
      if (isUndefined(dZIndex)) {
        if (isUndefined(__zIndex)) {
          if (isFixed) {
            const [key, maxZIndex] = MAX_INDEX_MANAGER.getMaxIndex();
            setZIndex(maxZIndex);
            return () => {
              MAX_INDEX_MANAGER.deleteRecord(key);
            };
          } else {
            setZIndex(toNumber(getComputedStyle(document.body).getPropertyValue(`--${dPrefix}absolute-z-index`)));
          }
        } else {
          setZIndex(__zIndex);
        }
      } else {
        setZIndex(dZIndex);
      }
    }
  }, [__zIndex, dPrefix, dZIndex, isFixed, setZIndex, visible]);
  //#endregion

  const childModal = useMemo(() => {
    if (dChildModal) {
      const _childModal = React.Children.only(dChildModal) as React.ReactElement<DModalProps>;
      return React.cloneElement<DModalProps>(_childModal, {
        ..._childModal.props,
        __zIndex: zIndex + 1,
      });
    }
    return null;
  }, [dChildModal, zIndex]);

  const contentProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () => ({
      className: getClassName(`${dPrefix}modal__content`),
      style: {
        width: dWidth,
      },
    }),
    [dPrefix, dWidth]
  );

  const closeModal = useCallback(() => {
    setVisible?.(false);
    dAfterClose?.();
  }, [dAfterClose, setVisible]);

  const modalNode = (
    <>
      <DDialog
        {...restProps}
        ref={dialogRef}
        className={getClassName(className, `${dPrefix}modal`)}
        dMask={dMask}
        dVisible={visible}
        onClose={closeModal}
        style={mergeStyle(style, { zIndex })}
        dContentProps={contentProps}
        dMaskClosable={dMaskClosable}
      >
        {dHeader}
        <div className={`${dPrefix}modal__body`}>{children}</div>
        {dFooter}
      </DDialog>
      {childModal}
    </>
  );

  return dContainer === false ? modalNode : containerRef.current && ReactDOM.createPortal(modalNode, containerRef.current);
}
