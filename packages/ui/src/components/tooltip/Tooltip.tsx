import type { DPopupProps, DPopupRef } from '../_popup';

import { isUndefined } from 'lodash';
import React, { useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useId } from '../../hooks';
import { getClassName } from '../../utils';
import { DPopup } from '../_popup';

export type DTooltipRef = DPopupRef;

export interface DTooltipProps extends Omit<DPopupProps, 'dPopupContent'> {
  dTitle: React.ReactNode;
}

export const DTooltip = React.forwardRef<DTooltipRef, DTooltipProps>((props, ref) => {
  const { dTitle, dTriggerNode, id, className, children, ...restProps } = useDComponentConfig('tooltip', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const _id = useId();
  const __id = id ?? `${dPrefix}tooltip-${_id}`;

  const child = useMemo(() => {
    if (isUndefined(dTriggerNode)) {
      const _child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
      return React.cloneElement(_child, {
        ..._child.props,
        'aria-describedby': __id,
      });
    }

    return null;
  }, [__id, children, dTriggerNode]);

  return (
    <DPopup
      {...restProps}
      ref={ref}
      id={__id}
      className={getClassName(className, `${dPrefix}tooltip`)}
      role="tooltip"
      dPopupContent={dTitle}
      dTriggerNode={dTriggerNode}
    >
      {child}
    </DPopup>
  );
});
