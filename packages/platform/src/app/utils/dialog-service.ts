/* eslint-disable @typescript-eslint/ban-types */
import { useDialogs } from '../core/state';
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

    useDialogs.setState((draft) => {
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
              const index = useDialogs.state.findIndex((n) => n.key === key);
              if (index !== -1) {
                useDialogs.setState((draft) => {
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
    const index = useDialogs.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useDialogs.setState((draft) => {
        draft[index].props.aVisible = false;
      });
    }
  }

  static rerender(key: string | number, type: any, props: any) {
    const index = useDialogs.state.findIndex((n) => n.key === key);
    if (index !== -1) {
      useDialogs.setState((draft) => {
        draft.splice(index, 1, { key, type, props: Object.assign(draft[index].props, props) });
      });
    }
  }

  static closeAll(animation = true) {
    if (animation) {
      useDialogs.setState((draft) => {
        draft.forEach((toast) => {
          toast.props.aVisible = false;
        });
      });
    } else {
      useDialogs.setState([]);
    }
  }
}
