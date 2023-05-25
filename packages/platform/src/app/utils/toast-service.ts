import type { DToastProps } from '@react-devui/ui';

import { GlobalStore } from '../core';
import { getGlobalKey } from './vars';

interface ToastInstance {
  key: string | number;
  close: () => void;
  rerender: (props: DToastProps) => void;
}

export class ToastService {
  static open(props: Omit<DToastProps, 'dVisible'>, _key?: string | number): ToastInstance {
    const key = _key ?? getGlobalKey();

    GlobalStore.set('toasts', (draft) => {
      draft.push({
        ...props,
        key,
        dVisible: true,
        onClose: () => {
          props.onClose?.();

          ToastService.close(key);
        },
        afterVisibleChange: (visible) => {
          props.afterVisibleChange?.(visible);

          if (!visible) {
            const index = GlobalStore.get('toasts').findIndex((n) => n.key === key);
            if (index !== -1) {
              GlobalStore.set('toasts', (draft) => {
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
        ToastService.close(key);
      },
      rerender: (props) => {
        ToastService.rerender(key, props);
      },
    };
  }

  static close(key: string | number) {
    const index = GlobalStore.get('toasts').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('toasts', (draft) => {
        draft[index].dVisible = false;
      });
    }
  }

  static rerender(key: string | number, props: Partial<DToastProps>) {
    const index = GlobalStore.get('toasts').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('toasts', (draft) => {
        draft[index] = Object.assign(draft[index], props);
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      GlobalStore.set('toasts', (draft) => {
        draft.forEach((toast) => {
          toast.dVisible = false;
        });
      });
    } else {
      GlobalStore.set('toasts', []);
    }
  }
}
