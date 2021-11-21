import type { DPopupProps, DPopupRef } from '../_popup';

import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useId } from '../../hooks';
import { getClassName } from '../../utils';
import { DPopup } from '../_popup';

export interface DTooltipProps extends Omit<DPopupProps, 'dTriggerNode'> {
  dTitle: React.ReactNode;
}

export const DTooltip = React.forwardRef<DPopupRef, DTooltipProps>((props, ref) => {
  const { dTitle, id, className, children, ...restProps } = useDComponentConfig('tooltip', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const _id = useId();
  const __id = id ?? `${dPrefix}tooltip-${_id}`;

  const child = useMemo(() => {
    const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(_child, {
      ..._child.props,
      'aria-describedby': __id,
    });
  }, [__id, children]);

  return (
    <DPopup {...restProps} ref={ref} id={__id} className={getClassName(className, `${dPrefix}tooltip`)} role="tooltip" dTriggerNode={child}>
      {dTitle}
    </DPopup>
  );
});
