import type { DTabsRef } from '@react-devui/ui/components/tabs';

import { isUndefined } from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { BellOutlined, LoadingOutlined } from '@react-devui/icons';
import { DAvatar, DBadge, DButton, DPopover, DSeparator, DTabs } from '@react-devui/ui';
import { getClassName } from '@react-devui/utils';

import { useNotificationState } from '../../../../../config/state';
import { AppList } from '../../../../components';
import styles from './Notification.module.scss';

export function AppNotification(props: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element | null {
  const [notification] = useNotificationState();
  const { t } = useTranslation();
  const tabsRef = useRef<DTabsRef>(null);

  const num = (() => {
    let n = 0;
    if (!isUndefined(notification)) {
      notification.forEach((notify) => {
        n += notify.list.filter((item) => !item.read).length;
      });
    }
    return n;
  })();

  return (
    <DPopover
      className={getClassName(styles['app-notification'], {
        [styles['app-notification--spinner']]: isUndefined(notification),
      })}
      dContent={
        isUndefined(notification) ? (
          <LoadingOutlined dTheme="primary" dSize={24} dSpin />
        ) : (
          <>
            <DTabs
              ref={tabsRef}
              dList={notification.map((notify) => ({
                id: notify.id,
                title: notify.title,
                panel: (
                  <AppList
                    aList={notify.list.map((item) => ({
                      avatar: <DAvatar dImg={{ src: '/assets/avatar.png', alt: 'avatar' }}></DAvatar>,
                      title: 'name',
                      description: item.message,
                      props: {
                        className: getClassName(styles['app-notification__item'], {
                          [styles['app-notification__item--read']]: item.read,
                        }),
                      },
                    }))}
                  ></AppList>
                ),
              }))}
              dCenter
            />
            <div className={styles['app-notification__actions']}>
              <DButton dType="link">{t('routes.layout.Clear notifications')}</DButton>
              <DSeparator style={{ margin: 0 }} dVertical></DSeparator>
              <DButton dType="link">{t('routes.layout.See more')}</DButton>
            </div>
          </>
        )
      }
      dTrigger="click"
      dPlacement="bottom-right"
      dArrow={false}
      dInWindow
      afterVisibleChange={(visible) => {
        if (visible && tabsRef.current) {
          tabsRef.current.updateIndicator();
        }
      }}
    >
      <button {...props} aria-label={t('routes.layout.Notification')}>
        <div style={{ position: 'relative' }}>
          <DBadge dValue={num} dDot />
          <BellOutlined />
        </div>
      </button>
    </DPopover>
  );
}
