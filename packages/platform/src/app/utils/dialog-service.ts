/* eslint-disable @typescript-eslint/ban-types */
import { GlobalStore } from '../core';
import { getGlobalKey } from './vars';

export interface AppDialogServiceSupport {
  aVisible: boolean;
  onClose: () => void;
  afterVisibleChange: (visible: boolean) => void;
}

interface DialogInstance<P extends {}> {
  key: string | number;
  close: () => void;
  rerender: (props: P) => void;
}

export class DialogService {
  static open<P extends {}>(type: React.FC<P>, props: P, _key?: string | number): DialogInstance<P> {
    const key = _key ?? getGlobalKey();

    GlobalStore.set('dialogs', (draft) => {
      draft.push({
        key,
        type,
        props: {
          ...props,
          aVisible: true,
          onClose: () => {
            props['onClose']?.();

            DialogService.close(key);
          },
          afterVisibleChange: (visible: boolean) => {
            props['afterVisibleChange']?.(visible);

            if (!visible) {
              const index = GlobalStore.get('dialogs').findIndex((n) => n.key === key);
              if (index !== -1) {
                GlobalStore.set('dialogs', (draft) => {
                  draft.splice(index, 1);
                });
              }
            }
          },
        },
      });
    });

    return {
      key,
      close: () => {
        DialogService.close(key);
      },
      rerender: (props) => {
        DialogService.rerender(key, type, props);
      },
    };
  }

  static close(key: string | number) {
    const index = GlobalStore.get('dialogs').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('dialogs', (draft) => {
        draft[index].props.aVisible = false;
      });
    }
  }

  static rerender(key: string | number, type: any, props: any) {
    const index = GlobalStore.get('dialogs').findIndex((n) => n.key === key);
    if (index !== -1) {
      GlobalStore.set('dialogs', (draft) => {
        draft.splice(index, 1, { key, type, props: Object.assign(draft[index].props, props) });
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      GlobalStore.set('dialogs', (draft) => {
        draft.forEach((toast) => {
          toast.props.aVisible = false;
        });
      });
    } else {
      GlobalStore.set('dialogs', []);
    }
  }
}
