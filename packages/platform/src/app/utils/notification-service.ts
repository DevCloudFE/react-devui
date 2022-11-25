import type { DNotificationProps } from '@react-devui/ui';

import { useNotifications } from '../core/state';
import { getGlobalKey } from './vars';

interface NotificationInstance {
  key: string | number;
  close: () => void;
  rerender: (props: DNotificationProps) => void;
}

export class NotificationService {
  static open(props: Omit<DNotificationProps, 'dVisible'>, _key?: string | number): NotificationInstance {
    const key = _key ?? getGlobalKey();

    useNotifications.setState((draft) => {
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
            const index = useNotifications.state.findIndex((n) => n.key === key);
            if (index !== -1) {
              useNotifications.setState((draft) => {
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
    const index = useNotifications.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useNotifications.setState((draft) => {
        draft[index].dVisible = false;
      });
    }
  }

  static rerender(key: string | number, props: DNotificationProps) {
    const index = useNotifications.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useNotifications.setState((draft) => {
        draft.splice(index, 1, { key, ...props });
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      useNotifications.setState((draft) => {
        draft.forEach((notification) => {
          notification.dVisible = false;
        });
      });
    } else {
      useNotifications.setState([]);
    }
  }
}
