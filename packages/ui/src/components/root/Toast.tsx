import type { DToastProps } from '../toast';
import type { Subscription } from 'rxjs';

import { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { useImmer, useIsomorphicLayoutEffect, usePrefixConfig } from '../../hooks';
import { DToast, ToastService, toastSubject } from '../toast';

export function Toast() {
  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [toasts, setToasts] = useImmer(new Map<number, DToastProps & { dVisible: boolean }>());

  useEffect(() => {
    const obs: Subscription[] = [];
    const mergeProps = (uniqueId: number, props: DToastProps) => {
      return {
        onClose: () => {
          props.onClose?.();

          ToastService.close(uniqueId);
        },
        afterVisibleChange: (visible: boolean) => {
          props.afterVisibleChange?.(visible);

          if (!visible) {
            setToasts((draft) => {
              draft.delete(uniqueId);
            });
          }
        },
      };
    };
    obs.push(
      toastSubject.open.subscribe({
        next: ({ uniqueId, props }) => {
          setToasts((draft) => {
            draft.set(uniqueId, { ...props, dVisible: true, ...mergeProps(uniqueId, props) });
          });
        },
      }),
      toastSubject.close.subscribe({
        next: (uniqueId) => {
          setToasts((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...props, dVisible: false });
            }
          });
        },
      }),
      toastSubject.rerender.subscribe({
        next: ({ uniqueId, props: newProps }) => {
          setToasts((draft) => {
            const props = draft.get(uniqueId);
            if (props) {
              draft.set(uniqueId, { ...newProps, dVisible: props.dVisible, ...mergeProps(uniqueId, newProps) });
            }
          });
        },
      }),
      toastSubject.closeAll.subscribe({
        next: (animation) => {
          setToasts((draft) => {
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
  }, [setToasts]);

  const getRoot = useCallback(
    (id: string) => {
      let root = document.getElementById(`${dPrefix}toast-root`);
      if (!root) {
        root = document.createElement('div');
        root.id = `${dPrefix}toast-root`;
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
  const [toastTRoot, setToastTRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setToastTRoot(getRoot(`${dPrefix}toast-t-root`));
  }, [dPrefix, getRoot]);
  const [toastBRoot, setToastBRoot] = useState<HTMLElement>();
  useIsomorphicLayoutEffect(() => {
    setToastBRoot(getRoot(`${dPrefix}toast-b-root`));
  }, [dPrefix, getRoot]);

  return (
    <>
      {toastTRoot &&
        ReactDOM.createPortal(
          Array.from(toasts.entries())
            .filter(([, toastProps]) => (toastProps.dPlacement ?? 'top') === 'top')
            .map(([uniqueId, toastProps]) => <DToast key={uniqueId} {...toastProps}></DToast>),
          toastTRoot
        )}
      {toastBRoot &&
        ReactDOM.createPortal(
          Array.from(toasts.entries())
            .filter(([, toastProps]) => toastProps.dPlacement === 'bottom')
            .map(([uniqueId, toastProps]) => <DToast key={uniqueId} {...toastProps}></DToast>),
          toastBRoot
        )}
    </>
  );
}
