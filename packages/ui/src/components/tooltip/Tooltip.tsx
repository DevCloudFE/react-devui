import type { Updater } from '../../hooks/immer';
import type { DPopupProps, DPopupRef, DTriggerRenderProps } from '../_popup';

import React, { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useId, useTwoWayBinding } from '../../hooks';
import { getClassName } from '../../utils';
import { DPopup } from '../_popup';

export type DTooltipRef = DPopupRef;

export interface DTooltipProps extends Omit<DPopupProps, 'dVisible' | 'dPopupContent'> {
  dVisible?: [boolean, Updater<boolean>?];
  dTitle: React.ReactNode;
}

const Tooltip: React.ForwardRefRenderFunction<DTooltipRef, DTooltipProps> = (props, ref) => {
  const { dVisible, dTitle, onVisibleChange, id, className, children, ...restProps } = useComponentConfig(DTooltip.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const _id = useId();
  const __id = id ?? `${dPrefix}tooltip-${_id}`;

  const [visible, changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);

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
      dVisible={visible}
      dPopupContent={dTitle}
      dTriggerRender={renderTrigger}
      onVisibleChange={changeVisible}
    />
  );
};

export const DTooltip = React.forwardRef(Tooltip);
