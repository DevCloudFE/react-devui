import { isUndefined } from 'lodash';
import { useId, useRef } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, ExclamationCircleOutlined, WarningOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DAlertDialog } from '../_alert-dialog';
import { DTransition } from '../_transition';

export interface DNotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle?: React.ReactNode;
  dDescription?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  dClosable?: boolean;
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const notificationSubject = {
  open$: new Subject<{ uniqueId: number; props: DNotificationProps }>(),
  close$: new Subject<number>(),
  rerender$: new Subject<{ uniqueId: number; props: DNotificationProps }>(),
  closeAll$: new Subject<boolean>(),
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
    notificationSubject.open$.next({ uniqueId: UNIQUEID, props });
    const notification = new Notification(UNIQUEID);
    NOTIFICATIONS.push(notification);
    return notification;
  }

  static close(uniqueId: number) {
    NOTIFICATIONS = NOTIFICATIONS.filter((item) => item.uniqueId !== uniqueId);
    notificationSubject.close$.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DNotificationProps) {
    notificationSubject.rerender$.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    NOTIFICATIONS = [];
    notificationSubject.closeAll$.next(animation);
  }
}

const TTANSITION_DURING = { enter: 133, leave: 166 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DNotification' });
export function DNotification(props: DNotificationProps & { dVisible: boolean }): JSX.Element | null {
  const {
    dVisible,
    dType,
    dIcon,
    dTitle,
    dDescription,
    dDuration = 9.6,
    dPlacement = 'right-top',
    dClosable = true,
    dEscClosable = true,
    onClose,
    afterVisibleChange,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dialogRef = useRef<HTMLDivElement>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const uniqueId = useId();
  const headerId = `${dPrefix}notification-header-${uniqueId}`;
  const contentId = `${dPrefix}notification-content-${uniqueId}`;

  return (
    <DTransition
      dIn={dVisible}
      dDuring={TTANSITION_DURING}
      dSkipFirstTransition={false}
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    >
      {(state) => {
        let transitionStyle: React.CSSProperties = {};
        switch (state) {
          case 'enter':
            transitionStyle = {
              transform: dPlacement === 'left-top' || dPlacement === 'left-bottom' ? 'translate(-100%, 0)' : 'translate(100%, 0)',
            };
            break;

          case 'entering':
            transitionStyle = { transition: `transform ${TTANSITION_DURING.enter}ms ease-out` };
            break;

          case 'leave':
            if (dialogRef.current) {
              const { height } = dialogRef.current.getBoundingClientRect();
              transitionStyle = { height, overflow: 'hidden' };
            }
            break;

          case 'leaving':
            transitionStyle = {
              height: 0,
              overflow: 'hidden',
              opacity: 0,
              marginBottom: 0,
              transition: `height ${TTANSITION_DURING.leave}ms ease-in, opacity ${TTANSITION_DURING.leave}ms ease-in, margin ${TTANSITION_DURING.leave}ms ease-in`,
            };
            break;

          case 'leaved':
            transitionStyle = { display: 'none' };
            break;

          default:
            break;
        }

        return (
          <DAlertDialog
            {...restProps}
            className={getClassName(className, `${dPrefix}notification`)}
            style={{
              ...style,
              ...transitionStyle,
            }}
            aria-labelledby={isUndefined(dTitle) ? undefined : headerId}
            aria-describedby={contentId}
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
                  <CheckCircleOutlined dTheme="success" />
                ) : dType === 'warning' ? (
                  <WarningOutlined dTheme="warning" />
                ) : dType === 'error' ? (
                  <CloseCircleOutlined dTheme="danger" />
                ) : (
                  <ExclamationCircleOutlined dTheme="primary" />
                )}
              </div>
            )}
            <div id={contentId} className={`${dPrefix}notification__content`}>
              {!isUndefined(dTitle) && (
                <div id={headerId} className={`${dPrefix}notification__title`}>
                  {dTitle}
                </div>
              )}
              {!isUndefined(dDescription) && <div className={`${dPrefix}notification__description`}>{dDescription}</div>}
              {dClosable && (
                <button
                  className={getClassName(`${dPrefix}icon-button`, `${dPrefix}notification__close`)}
                  aria-label={t('Close')}
                  onClick={onClose}
                >
                  <CloseOutlined dSize={18} />
                </button>
              )}
            </div>
          </DAlertDialog>
        );
      }}
    </DTransition>
  );
}
