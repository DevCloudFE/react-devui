import type { DTransitionProps } from '../_transition';

import React, { useCallback } from 'react';

import { useCustomRef, useDPrefixConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { DTransition } from '../_transition';

export interface DMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dTransitionProps?: Omit<DTransitionProps, 'dEl' | 'children'>;
  onClose?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

export function DMask(props: DMaskProps) {
  const { dVisible, dTransitionProps, onClose, afterVisibleChange, className, onClick, ...restProps } = props;

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [maskEl, maskRef] = useCustomRef<HTMLElement>();
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
      dEl={maskEl}
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
      dDestroy
      {...dTransitionProps}
    >
      <div {...restProps} ref={maskRef} className={getClassName(className, `${dPrefix}mask`)} onClick={handleClick}></div>
    </DTransition>
  );
}
