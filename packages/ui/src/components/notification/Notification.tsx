import { isUndefined } from 'lodash';
import React, { useId } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useRefCallback, useDTransition, useTranslation } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DAlertDialog } from '../_alert-dialog';
import { DButton } from '../button';
import { DIcon } from '../icon';

export interface DNotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle?: React.ReactNode;
  dDescription?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  dClosable?: boolean;
  dCloseIcon?: React.ReactNode;
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const notificationSubject = {
  open: new Subject<{ uniqueId: number; props: DNotificationProps }>(),
  close: new Subject<number>(),
  rerender: new Subject<{ uniqueId: number; props: DNotificationProps }>(),
  closeAll: new Subject<boolean>(),
};

class Notification {
  constructor(private _uniqueId: number) {}

  get uniqueId() {
    return this._uniqueId;
  }

  close() {
    NotificationService.close(this._uniqueId);
  }

  rerender(props: DNotificationProps) {
    NotificationService.rerender(this._uniqueId, props);
  }
}

let NOTIFICATIONS: Notification[] = [];
let UNIQUEID = 1;
export class NotificationService {
  static get notifications() {
    return NOTIFICATIONS;
  }

  static open(props: DNotificationProps) {
    UNIQUEID += 1;
    notificationSubject.open.next({ uniqueId: UNIQUEID, props });
    const notification = new Notification(UNIQUEID);
    NOTIFICATIONS.push(notification);
    return notification;
  }

  static close(uniqueId: number) {
    NOTIFICATIONS = NOTIFICATIONS.filter((item) => item.uniqueId !== uniqueId);
    notificationSubject.close.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DNotificationProps) {
    notificationSubject.rerender.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    NOTIFICATIONS = [];
    notificationSubject.closeAll.next(animation);
  }
}

const { COMPONENT_NAME } = generateComponentMate('DNotification');
export function DNotification(props: DNotificationProps & { dVisible: boolean }) {
  const {
    dVisible,
    dType,
    dIcon,
    dTitle,
    dDescription,
    dDuration = 9.6,
    dPlacement = 'right-top',
    dClosable = true,
    dCloseIcon,
    dEscClosable = true,
    onClose,
    afterVisibleChange,
    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [dialogEl, dialogRef] = useRefCallback<HTMLDivElement>();
  //#endregion

  const [t] = useTranslation('Common');

  const uniqueId = useId();

  const hidden = useDTransition({
    dEl: dialogEl,
    dVisible,
    dSkipFirst: false,
    dCallbackList: {
      beforeEnter: () => {
        const transform = dPlacement === 'left-top' || dPlacement === 'left-bottom' ? 'translate(-100%, 0)' : 'translate(100%, 0)';
        return {
          'enter-from': { transform },
          'enter-to': { transition: 'transform 133ms ease-out' },
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
      className={getClassName(className, `${dPrefix}notification`)}
      aria-labelledby={isUndefined(dTitle) ? undefined : `${dPrefix}notification-header-${uniqueId}`}
      aria-describedby={`${dPrefix}notification-content-${uniqueId}`}
      dHidden={hidden}
      dDuration={dDuration}
      dEscClosable={dEscClosable}
      dDialogRef={dialogRef}
      onClose={onClose}
    >
      {(!isUndefined(dType) || !isUndefined(dIcon)) && (
        <div className={`${dPrefix}notification__icon`}>
          {!isUndefined(dIcon) ? (
            dIcon
          ) : dType === 'success' ? (
            <DIcon viewBox="64 64 896 896" dTheme="success">
              <path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z"></path>
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
            </DIcon>
          ) : dType === 'warning' ? (
            <DIcon viewBox="64 64 896 896" dTheme="warning">
              <path d="M464 720a48 48 0 1096 0 48 48 0 10-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"></path>
            </DIcon>
          ) : dType === 'error' ? (
            <DIcon viewBox="64 64 896 896" dTheme="danger">
              <path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path>
              <path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
            </DIcon>
          ) : (
            <DIcon viewBox="64 64 896 896" dTheme="primary">
              <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
              <path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"></path>
            </DIcon>
          )}
        </div>
      )}
      <div id={`${dPrefix}notification-content-${uniqueId}`} className={getClassName(`${dPrefix}notification__content`)}>
        {!isUndefined(dTitle) && (
          <div id={`${dPrefix}notification-header-${uniqueId}`} className={`${dPrefix}notification__title`}>
            {dTitle}
          </div>
        )}
        <div className={`${dPrefix}notification__description`}>{dDescription}</div>
        {dClosable && (
          <DButton
            className={`${dPrefix}notification__close`}
            aria-label={t('Close')}
            dType="text"
            dIcon={
              isUndefined(dCloseIcon) ? (
                <DIcon viewBox="64 64 896 896" dSize={18}>
                  <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                </DIcon>
              ) : (
                dCloseIcon
              )
            }
            onClick={onClose}
          ></DButton>
        )}
      </div>
    </DAlertDialog>
  );
}
