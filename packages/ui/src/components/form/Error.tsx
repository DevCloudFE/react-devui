import { usePrefixConfig, useDCollapseTransition, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';

export interface DErrorProps {
  dVisible: boolean;
  dMessage: string;
  dStatus?: 'error' | 'warning';
  onHidden?: () => void;
}

export function DError(props: DErrorProps): JSX.Element | null {
  const { dVisible, dMessage, dStatus = 'error', onHidden } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [el, ref] = useRefCallback<HTMLDivElement>();
  //#endregion

  const transitionState = {
    'enter-from': { height: '0', opacity: '0' },
    'enter-to': { transition: 'height 133ms ease-out, opacity 133ms ease-out' },
    'leave-to': { height: '0', opacity: '0', transition: 'height 133ms ease-in, opacity 133ms ease-in' },
  };
  const hidden = useDCollapseTransition({
    dEl: el,
    dVisible,
    dSkipFirst: false,
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
    afterLeave: () => {
      onHidden?.();
    },
  });

  return hidden ? null : (
    <div
      ref={ref}
      className={getClassName(`${dPrefix}form-error`, {
        [`${dPrefix}form-error--error`]: dStatus === 'error',
        [`${dPrefix}form-error--warning`]: dStatus === 'warning',
      })}
      title={dMessage}
    >
      {dMessage}
    </div>
  );
}
