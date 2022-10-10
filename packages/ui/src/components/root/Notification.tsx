import type { DNotificationProps } from '../notification';
import type { Subscription } from 'rxjs';

import { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { useImmer, useRefExtra } from '@react-devui/hooks';

import { NotificationService, NOTIFICATION_SUBJECT } from '../notification';
import { DNotification } from '../notification/Notification';
import { usePrefixConfig } from './hooks';

export function Notification(): JSX.Element | null {
  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [notifications, setNotifications] = useImmer(new Map<number, DNotificationProps & { dVisible: boolean }>());

  const getRoot = (id: string) => {
    let root = document.getElementById(`${dPrefix}notification-root`);
    if (!root) {
      root = document.createElement('div');
      root.id = `${dPrefix}notification-root`;
      document.body.appendChild(root);
    }

    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      root.appendChild(el);
    }
    return el;
  };
  const notificationLTRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-lt-root`), true);
  const notificationRTRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-rt-root`), true);
  const notificationLBRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-lb-root`), true);
  const notificationRBRootRef = useRefExtra(() => getRoot(`${dPrefix}notification-rb-root`), true);

  useEffect(() => {
    const obs: Subscription[] = [];
    const mergeProps = (uniqueId: number, props: DNotificationProps) => {
      return {
        onClose: () => {
          props.onClose?.();

          NotificationService.close(uniqueId);
        },
        afterVisibleChange: (visible: boolean) => {
          props.afterVisibleChange?.(visible);

          if (!visible) {
            setNotifications((draft) => {
              draft.delete(uniqueId);
            });
          }
        },
      };
    };
    obs.push(
      NOTIFICATION_SUBJECT.open$.subscribe({
        next: ({ uniqueId, props }) => {
          setNotifications((draft) => {
            draft.set(uniqueId, { ...props, dVisible: true, ...mergeProps(uniqueId, props) });
          });
        },
      }),
      NOTIFICATION_SUBJECT.close$.subscribe({
        next: (uniqueId) => {
          setNotifications((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...props, dVisible: false });
            }
          });
        },
      }),
      NOTIFICATION_SUBJECT.rerender$.subscribe({
        next: ({ uniqueId, props: newProps }) => {
          setNotifications((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...newProps, dVisible: props.dVisible, ...mergeProps(uniqueId, newProps) });
            }
          });
        },
      }),
      NOTIFICATION_SUBJECT.closeAll$.subscribe({
        next: (animation) => {
          setNotifications((draft) => {
            if (animation) {
              for (const props of draft.values()) {
                props.dVisible = false;
              }
            } else {
              draft.clear();
            }
          });
        },
      })
    );
  }, [setNotifications]);

  return (
    <>
      {notificationLTRootRef.current &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'left-top')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationLTRootRef.current
        )}
      {notificationRTRootRef.current &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => (notificationProps.dPlacement ?? 'right-top') === 'right-top')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationRTRootRef.current
        )}
      {notificationLBRootRef.current &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'left-bottom')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationLBRootRef.current
        )}
      {notificationRBRootRef.current &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'right-bottom')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationRBRootRef.current
        )}
    </>
  );
}
