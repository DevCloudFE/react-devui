import { useRef } from 'react';
import { Subject } from 'rxjs';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DAlertPopover } from '../_alert-popover';
import { DTransition } from '../_transition';
import { DNotificationPanel } from './NotificationPanel';

export interface DNotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDescription?: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom';
  dActions?: React.ReactNode[];
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
    dActions = ['close'],
    dEscClosable = true,
    onClose,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Ref
  const panelRef = useRef<HTMLDivElement>(null);
  //#endregion

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
            transitionStyle = {
              transition: ['transform'].map((attr) => `${attr} ${TTANSITION_DURING.enter}ms ease-out`).join(', '),
            };
            break;

          case 'leave':
            if (panelRef.current) {
              const { height } = panelRef.current.getBoundingClientRect();
              transitionStyle = { height, overflow: 'hidden' };
            }
            break;

          case 'leaving':
            transitionStyle = {
              height: 0,
              overflow: 'hidden',
              paddingTop: 0,
              paddingBottom: 0,
              marginTop: 0,
              marginBottom: 0,
              opacity: 0,
              transition: ['height', 'padding', 'margin', 'opacity']
                .map((attr) => `${attr} ${TTANSITION_DURING.leave}ms ease-in`)
                .join(', '),
            };
            break;

          case 'leaved':
            transitionStyle = { display: 'none' };
            break;

          default:
            break;
        }

        return (
          <DAlertPopover dDuration={dDuration} dEscClosable={dEscClosable} onClose={onClose}>
            <DNotificationPanel
              {...restProps}
              ref={panelRef}
              style={{
                ...restProps.style,
                ...transitionStyle,
              }}
              dClassNamePrefix="notification"
              dType={dType}
              dIcon={dIcon}
              dTitle={dTitle}
              dDescription={dDescription}
              dActions={dActions}
              onClose={onClose}
            ></DNotificationPanel>
          </DAlertPopover>
        );
      }}
    </DTransition>
  );
}
