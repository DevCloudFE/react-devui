import type { DTransitionProps } from '../../hooks/transition';

import { usePrefixConfig, useDTransition, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';

export interface DMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dTransitionProps?: Omit<DTransitionProps, 'dRender'>;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export function DMask(props: DMaskProps): JSX.Element | null {
  const { dVisible, dTransitionProps, onClose, afterVisibleChange, className, onClick, ...restProps } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [el, ref] = useRefCallback();
  //#endregion

  const transitionState = {
    'enter-from': { opacity: '0' },
    'enter-to': { transition: 'opacity 0.1s linear' },
    'leave-to': { opacity: '0', transition: 'opacity 0.1s linear' },
  };
  const hidden = useDTransition({
    dEl: el,
    dVisible,
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
    dSkipFirst: false,
    afterEnter: () => {
      afterVisibleChange?.(true);
    },
    afterLeave: () => {
      afterVisibleChange?.(false);
    },
    ...dTransitionProps,
  });

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    onClick?.(e);

    onClose?.();
  };

  return hidden ? null : <div {...restProps} ref={ref} className={getClassName(className, `${dPrefix}mask`)} onClick={handleClick}></div>;
}
