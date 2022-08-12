import { useRef } from 'react';
import { Subject } from 'rxjs';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DAlertPopover } from '../_alert-popover';
import { DTransition } from '../_transition';
import { DPanel } from './Panel';

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

export const toastSubject = {
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
    toastSubject.open$.next({ uniqueId: UNIQUEID, props });
    const toast = new Toast(UNIQUEID);
    TOASTS.push(toast);
    return toast;
  }

  static close(uniqueId: number) {
    TOASTS = TOASTS.filter((item) => item.uniqueId !== uniqueId);
    toastSubject.close$.next(uniqueId);
  }

  static rerender(uniqueId: number, props: DToastProps) {
    toastSubject.rerender$.next({ uniqueId, props });
  }

  static closeAll(animation = true) {
    TOASTS = [];
    toastSubject.closeAll$.next(animation);
  }
}

const TTANSITION_DURING = { enter: 133, leave: 166 };
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DToast' });
export function DToast(props: DToastProps & { dVisible: boolean }): JSX.Element | null {
  const {
    dVisible,
    dType,
    dIcon,
    dContent,
    dDuration = 2,
    dPlacement = 'top',
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
              transform: dPlacement === 'top' ? 'translate(0, -70%)' : 'translate(0, 70%)',
              opacity: 0,
            };
            break;

          case 'entering':
            transitionStyle = {
              transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING.enter}ms ease-out`).join(', '),
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
            <DPanel
              {...restProps}
              ref={panelRef}
              style={{
                ...restProps.style,
                ...transitionStyle,
              }}
              dClassNamePrefix="toast"
              dType={dType}
              dIcon={dIcon}
              dContent={dContent}
              dActions={[]}
            ></DPanel>
          </DAlertPopover>
        );
      }}
    </DTransition>
  );
}
