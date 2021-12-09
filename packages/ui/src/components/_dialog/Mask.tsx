import type { DTransitionProps } from '../_transition';

import React, { useCallback } from 'react';

import { usePrefixConfig, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';
import { DTransition } from '../_transition';

export interface DMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dTransitionProps?: Omit<DTransitionProps, 'dRender'>;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export function DMask(props: DMaskProps) {
  const { dVisible, dTransitionProps, onClose, afterVisibleChange, className, onClick, ...restProps } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [el, ref] = useRefCallback();
  //#endregion

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);
      onClose?.();
    },
    [onClick, onClose]
  );

  const transitionState = {
    'enter-from': { opacity: '0' },
    'enter-to': { transition: 'opacity 0.1s linear' },
    'leave-to': { opacity: '0', transition: 'opacity 0.1s linear' },
  };

  return (
    <DTransition
      dEl={el}
      dVisible={dVisible}
      dCallbackList={{
        beforeEnter: () => transitionState,
        afterEnter: () => {
          afterVisibleChange?.(true);
        },
        beforeLeave: () => transitionState,
        afterLeave: () => {
          afterVisibleChange?.(false);
        },
      }}
      dRender={(hidden) =>
        !hidden && <div {...restProps} ref={ref} className={getClassName(className, `${dPrefix}mask`)} onClick={handleClick}></div>
      }
      dSkipFirst={false}
      {...dTransitionProps}
    />
  );
}
