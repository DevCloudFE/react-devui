import { isUndefined } from 'lodash';
import { useId, useRef } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DAlert } from '../_alert';
import { DTransition } from '../_transition';

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

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const alertRef = useRef<HTMLDivElement>(null);
  //#endregion

  const uniqueId = useId();
  const contentId = `${dPrefix}toast-content-${uniqueId}`;

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
              transition: `transform ${TTANSITION_DURING.enter}ms ease-out, opacity ${TTANSITION_DURING.enter}ms ease-out`,
            };
            break;

          case 'leave':
            if (alertRef.current) {
              const { height } = alertRef.current.getBoundingClientRect();
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
          <DAlert
            {...restProps}
            style={{
              ...restProps.style,
              ...transitionStyle,
            }}
            aria-describedby={restProps['aria-describedby'] ?? contentId}
            dClassNamePrefix="toast"
            dDuration={dDuration}
            dEscClosable={dEscClosable}
            dAlertRef={alertRef}
            onClose={onClose}
          >
            {(!isUndefined(dType) || !isUndefined(dIcon)) && (
              <div className={`${dPrefix}toast__icon`}>
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
            <div id={contentId} className={getClassName(`${dPrefix}toast__content`)}>
              {dContent}
            </div>
          </DAlert>
        );
      }}
    </DTransition>
  );
}
