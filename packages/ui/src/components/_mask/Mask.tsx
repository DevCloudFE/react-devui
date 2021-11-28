import type { DTransitionProps } from '../_transition';

import React, { useCallback } from 'react';

import { useDPrefixConfig, useRefCallback } from '../../hooks';
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
  const dPrefix = useDPrefixConfig();
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

  return (
    <DTransition
      dEl={el}
      dVisible={dVisible}
      dStateList={{
        'enter-from': { opacity: '0' },
        'enter-to': { transition: 'opacity 0.1s linear' },
        'leave-to': { opacity: '0', transition: 'opacity 0.1s linear' },
      }}
      dCallbackList={{
        afterEnter: () => {
          afterVisibleChange?.(true);
        },
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
