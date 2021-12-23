import React from 'react';

import { usePrefixConfig, useDCollapseTransition, useRefCallback } from '../../hooks';
import { getClassName } from '../../utils';

export interface DErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible: boolean;
  dMessage: string;
  dStatus?: 'error' | 'warning';
  onHidden?: () => void;
}

export function DError(props: DErrorProps) {
  const { dVisible, dMessage, dStatus = 'error', onHidden, className, children, ...restProps } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [el, ref] = useRefCallback<HTMLDivElement>();
  //#endregion

  const hidden = useDCollapseTransition({
    dEl: el,
    dVisible,
    dSkipFirst: false,
    dDuring: 133,
    afterLeave: () => {
      onHidden?.();
    },
  });

  return hidden ? null : (
    <div
      {...restProps}
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
