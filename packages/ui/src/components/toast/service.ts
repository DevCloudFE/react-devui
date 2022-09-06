import { Subject } from 'rxjs';

export interface DToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dType?: 'success' | 'warning' | 'error' | 'info';
  dIcon?: React.ReactNode;
  dContent: React.ReactNode;
  dDuration?: number;
  dPlacement?: 'top' | 'bottom';
  dEscClosable?: boolean;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export const TOAST_SUBJECT = {
  open$: new Subject<{ uniqueId: number; props: DToastProps }>(),
  close$: new Subject<number>(),
  rerender$: new Subject<{ uniqueId: number; props: DToastProps }>(),
  closeAll$: new Subject<boolean>(),
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
    return TOASTS;
  }

  static open(props: DToastProps) {
    UNIQUEID += 1;
    TOAST_SUBJECT.open$.next({ uniqueId: UNIQUEID, props });
    const toast = new Toast(UNIQUEID);
    TOASTS.push(toast);
    return toast;
  }

  static close(uniqueId: number) {
    TOASTS = TOASTS.filter((item) => item.uniqueId !== uniqueId);
    TOAST_SUBJECT.close$.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DToastProps) {
    TOAST_SUBJECT.rerender$.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    TOASTS = [];
    TOAST_SUBJECT.closeAll$.next(animation);
  }
}
