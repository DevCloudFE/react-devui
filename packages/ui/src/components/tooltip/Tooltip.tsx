import type { DPopupProps, DPopupRef, DTriggerRenderProps } from '../_popup';

import React, { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useId } from '../../hooks';
import { getClassName } from '../../utils';
import { DPopup } from '../_popup';

export type DTooltipRef = DPopupRef;

export interface DTooltipProps extends Omit<DPopupProps, 'dPopupContent'> {
  dTitle: React.ReactNode;
}

export const DTooltip = React.forwardRef<DTooltipRef, DTooltipProps>((props, ref) => {
  const { dTitle, id, className, children, ...restProps } = useDComponentConfig('tooltip', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  const _id = useId();
  const __id = id ?? `${dPrefix}tooltip-${_id}`;

  const renderTrigger = useCallback(
    ({ onMouseEnter, onMouseLeave, onFocus, onBlur, onClick, ...renderProps }: DTriggerRenderProps) => {
      if (children) {
        const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

        const _renderProps: DTriggerRenderProps = renderProps;
        if (onMouseEnter) {
          _renderProps.onMouseEnter = (e) => {
            child.props.onMouseEnter?.(e);
            onMouseEnter?.(e);
          };
          _renderProps.onMouseLeave = (e) => {
            child.props.onMouseLeave?.(e);
            onMouseLeave?.(e);
          };
        }
        if (onFocus) {
          _renderProps.onFocus = (e) => {
            child.props.onFocus?.(e);
            onFocus?.(e);
          };
          _renderProps.onBlur = (e) => {
            child.props.onBlur?.(e);
            onBlur?.(e);
          };
        }
        if (onClick) {
          _renderProps.onClick = (e) => {
            child.props.onClick?.(e);
            onClick?.(e);
          };
        }
        return React.cloneElement(child, {
          ...child.props,
          ..._renderProps,
          'aria-describedby': __id,
        });
      }

      return null;
    },
    [__id, children]
  );

  return (
    <DPopup
      {...restProps}
      ref={ref}
      id={__id}
      className={getClassName(className, `${dPrefix}tooltip`)}
      role="tooltip"
      dPopupContent={dTitle}
      dTriggerRender={renderTrigger}
    />
  );
});
