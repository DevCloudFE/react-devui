import type { DToastProps } from '@react-devui/ui';

import { useToasts } from '../core/state';
import { getGlobalKey } from './vars';

interface ToastInstance {
  key: string | number;
  close: () => void;
  rerender: (props: DToastProps) => void;
}

export class ToastService {
  static open(props: Omit<DToastProps, 'dVisible'>, _key?: string | number): ToastInstance {
    const key = _key ?? getGlobalKey();

    useToasts.setState((draft) => {
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
            const index = useToasts.state.findIndex((n) => n.key === key);
            if (index !== -1) {
              useToasts.setState((draft) => {
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
    const index = useToasts.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useToasts.setState((draft) => {
        draft[index].dVisible = false;
      });
    }
  }

  static rerender(key: string | number, props: Partial<DToastProps>) {
    const index = useToasts.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useToasts.setState((draft) => {
        draft[index] = Object.assign(draft[index], props);
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      useToasts.setState((draft) => {
        draft.forEach((toast) => {
          toast.dVisible = false;
        });
      });
    } else {
      useToasts.setState([]);
    }
  }
}
