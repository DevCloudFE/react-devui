import { Subject } from 'rxjs';

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

export const NOTIFICATION_SUBJECT = {
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
    NOTIFICATION_SUBJECT.open$.next({ uniqueId: UNIQUEID, props });
    const notification = new Notification(UNIQUEID);
    NOTIFICATIONS.push(notification);
    return notification;
  }

  static close(uniqueId: number) {
    NOTIFICATIONS = NOTIFICATIONS.filter((item) => item.uniqueId !== uniqueId);
    NOTIFICATION_SUBJECT.close$.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DNotificationProps) {
    NOTIFICATION_SUBJECT.rerender$.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    NOTIFICATIONS = [];
    NOTIFICATION_SUBJECT.closeAll$.next(animation);
  }
}
