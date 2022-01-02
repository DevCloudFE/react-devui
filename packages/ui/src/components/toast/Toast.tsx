import { isUndefined } from 'lodash';
import React, { useId } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useRefCallback, useDTransition } from '../../hooks';
import { getClassName } from '../../utils';
import { DAlertDialog } from '../_alert-dialog';
import { DIcon } from '../icon';

export interface DToastProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dContent: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'top' | 'bottom';
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const toastSubject = {
  open: new Subject<{ uniqueId: number; props: DToastProps }>(),
  close: new Subject<number>(),
  rerender: new Subject<{ uniqueId: number; props: DToastProps }>(),
  closeAll: new Subject<boolean>(),
};

class Toast {
  constructor(private _uniqueId: number) {}

  get uniqueId() {
    return this._uniqueId;
  }

  close() {
    ToastService.close(this._uniqueId);
  }

  rerender(props: DToastProps) {
    ToastService.rerender(this._uniqueId, props);
  }
}

let TOASTS: Toast[] = [];
let UNIQUEID = 1;
export class ToastService {
  static get toasts() {
    return [...TOASTS];
  }

  static open(props: DToastProps) {
    UNIQUEID += 1;
    toastSubject.open.next({ uniqueId: UNIQUEID, props });
    const toast = new Toast(UNIQUEID);
    TOASTS.push(toast);
    return toast;
  }

  static close(uniqueId: number) {
    TOASTS = TOASTS.filter((item) => item.uniqueId !== uniqueId);
    toastSubject.close.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DToastProps) {
    toastSubject.rerender.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    TOASTS = [];
    toastSubject.closeAll.next(animation);
  }
}

export function DToast(props: DToastProps & { dVisible: boolean }) {
  const {
    dVisible,
    dType,
    dIcon,
    dContent,
    dDuration = 2,
    dPlacement = 'top',
    onClose,
    afterVisibleChange,
    className,
    ...restProps
  } = useComponentConfig(DToast.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogEl, dialogRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const uniqueId = useId();

  const hidden = useDTransition({
    dEl: dialogEl,
    dVisible,
    dSkipFirst: false,
    dCallbackList: {
      beforeEnter: () => {
        const transform = dPlacement === 'top' ? 'translate(0, -70%)' : 'translate(0, 70%)';
        return {
          'enter-from': { transform, opacity: '0' },
          'enter-to': { transition: 'transform 133ms ease-out, opacity 133ms ease-out' },
        };
      },
      beforeLeave: (el) => {
        const rect = el.getBoundingClientRect();

        return {
          'leave-from': { height: rect.height + 'px' },
          'leave-active': { overflow: 'hidden' },
          'leave-to': {
            height: '0',
            opacity: '0',
            marginBottom: '0',
            transition: 'height 166ms ease-in, opacity 166ms ease-in, margin 166ms ease-in',
          },
        };
      },
    },
    afterEnter: () => {
      afterVisibleChange?.(true);
    },
    afterLeave: () => {
      afterVisibleChange?.(false);
    },
  });

  return (
    <DAlertDialog
      {...restProps}
      className={getClassName(className, `${dPrefix}toast`)}
      aria-describedby={`${dPrefix}toast-content-${uniqueId}`}
      dHidden={hidden}
      dDuration={dDuration}
      dDialogRef={dialogRef}
      onClose={onClose}
    >
      {(!isUndefined(dType) || !isUndefined(dIcon)) && (
        <div className={`${dPrefix}toast__icon`}>
          {!isUndefined(dIcon) ? (
            dIcon
          ) : dType === 'success' ? (
            <DIcon viewBox="64 64 896 896" dTheme="success">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
            </DIcon>
          ) : dType === 'warning' ? (
            <DIcon viewBox="64 64 896 896" dTheme="warning">
              <path d="M955.7 856l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zM480 416c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v184c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V416zm32 352a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
            </DIcon>
          ) : dType === 'error' ? (
            <DIcon viewBox="64 64 896 896" dTheme="danger">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
            </DIcon>
          ) : (
            <DIcon viewBox="64 64 896 896" dTheme="primary">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
            </DIcon>
          )}
        </div>
      )}
      <div id={`${dPrefix}toast-content-${uniqueId}`} className={getClassName(`${dPrefix}toast__content`)}>
        {dContent}
      </div>
    </DAlertDialog>
  );
}
