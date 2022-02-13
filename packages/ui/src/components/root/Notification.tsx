import type { DNotificationProps } from '../notification';
import type { Subscription } from 'rxjs';

import { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { useImmer, useIsomorphicLayoutEffect, usePrefixConfig } from '../../hooks';
import { DNotification, NotificationService, notificationSubject } from '../notification';

export function Notification() {
  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [notifications, setNotifications] = useImmer(new Map<number, DNotificationProps & { dVisible: boolean }>());

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
      notificationSubject.open$.subscribe({
        next: ({ uniqueId, props }) => {
          setNotifications((draft) => {
            draft.set(uniqueId, { ...props, dVisible: true, ...mergeProps(uniqueId, props) });
          });
        },
      }),
      notificationSubject.close$.subscribe({
        next: (uniqueId) => {
          setNotifications((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...props, dVisible: false });
            }
          });
        },
      }),
      notificationSubject.rerender$.subscribe({
        next: ({ uniqueId, props: newProps }) => {
          setNotifications((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...newProps, dVisible: props.dVisible, ...mergeProps(uniqueId, newProps) });
            }
          });
        },
      }),
      notificationSubject.closeAll$.subscribe({
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

  const getRoot = useCallback(
    (id: string) => {
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
    },
    [dPrefix]
  );
  const [notificationLTRoot, setNotificationLTRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setNotificationLTRoot(getRoot(`${dPrefix}notification-lt-root`));
  }, [dPrefix, getRoot]);
  const [notificationRTRoot, setNotificationRTRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setNotificationRTRoot(getRoot(`${dPrefix}notification-rt-root`));
  }, [dPrefix, getRoot]);
  const [notificationLBRoot, setNotificationLBRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setNotificationLBRoot(getRoot(`${dPrefix}notification-lb-root`));
  }, [dPrefix, getRoot]);
  const [notificationRBRoot, setNotificationRBRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setNotificationRBRoot(getRoot(`${dPrefix}notification-rb-root`));
  }, [dPrefix, getRoot]);

  return (
    <>
      {notificationLTRoot &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'left-top')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationLTRoot
        )}
      {notificationRTRoot &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => (notificationProps.dPlacement ?? 'right-top') === 'right-top')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationRTRoot
        )}
      {notificationLBRoot &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'left-bottom')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationLBRoot
        )}
      {notificationRBRoot &&
        ReactDOM.createPortal(
          Array.from(notifications.entries())
            .filter(([, notificationProps]) => notificationProps.dPlacement === 'right-bottom')
            .map(([uniqueId, notificationProps]) => <DNotification key={uniqueId} {...notificationProps}></DNotification>),
          notificationRBRoot
        )}
    </>
  );
}
