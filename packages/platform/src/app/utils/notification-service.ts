import type { DNotificationProps } from '@react-devui/ui';

import { GlobalStore } from '../core';
import { getGlobalKey } from './vars';

interface NotificationInstance {
  key: string | number;
  close: () => void;
  rerender: (props: DNotificationProps) => void;
}

export class NotificationService {
  static open(props: Omit<DNotificationProps, 'dVisible'>, _key?: string | number): NotificationInstance {
    const key = _key ?? getGlobalKey();

    GlobalStore.set('notifications', (draft) => {
      draft.push({
        ...props,
        key,
        dVisible: true,
        onClose: () => {
          props.onClose?.();

          NotificationService.close(key);
        },
        afterVisibleChange: (visible) => {
          props.afterVisibleChange?.(visible);

          if (!visible) {
            const index = GlobalStore.get('notifications').findIndex((n) => n.key === key);
            if (index !== -1) {
              GlobalStore.set('notifications', (draft) => {
                draft.splice(index, 1);
              });
            }
          }
        },
      });
    });

    return {
      key,
      close: () => {
        NotificationService.close(key);
      },
      rerender: (props) => {
        NotificationService.rerender(key, props);
      },
    };
  }

  static close(key: string | number) {
    const index = GlobalStore.get('notifications').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('notifications', (draft) => {
        draft[index].dVisible = false;
      });
    }
  }

  static rerender(key: string | number, props: Partial<DNotificationProps>) {
    const index = GlobalStore.get('notifications').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('notifications', (draft) => {
        draft[index] = Object.assign(draft[index], props);
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      GlobalStore.set('notifications', (draft) => {
        draft.forEach((notification) => {
          notification.dVisible = false;
        });
      });
    } else {
      GlobalStore.set('notifications', []);
    }
  }
}
