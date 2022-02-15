import type { DUpdater } from '../../hooks/two-way-binding';
import type { DPopupProps, DPopupRef, DTriggerRenderProps } from '../_popup';

import React, { useId } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DPopup } from '../_popup';

export type DTooltipRef = DPopupRef;

export interface DTooltipProps extends Omit<DPopupProps, 'dVisible' | 'dPopupContent'> {
  dVisible?: [boolean, DUpdater<boolean>?];
  dTitle: React.ReactNode;
}

const { COMPONENT_NAME } = generateComponentMate('DTooltip');
const Tooltip: React.ForwardRefRenderFunction<DTooltipRef, DTooltipProps> = (props, ref) => {
  const { dVisible, dTitle, onVisibleChange, id, className, children, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}tooltip-${uniqueId}`;

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);

  return (
    <DPopup
      {...restProps}
      ref={ref}
      id={_id}
      className={getClassName(className, `${dPrefix}tooltip`)}
      role="tooltip"
      dVisible={visible}
      dPopupContent={dTitle}
      dTriggerRender={({ onMouseEnter, onMouseLeave, onFocus, onBlur, onClick, ...renderProps }) => {
        if (children) {
          const child = React.Children.only(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

          const props: DTriggerRenderProps = renderProps;
          if (onMouseEnter) {
            props.onMouseEnter = (e) => {
              child.props.onMouseEnter?.(e);
              onMouseEnter?.(e);
            };
            props.onMouseLeave = (e) => {
              child.props.onMouseLeave?.(e);
              onMouseLeave?.(e);
            };
          }
          if (onFocus) {
            props.onFocus = (e) => {
              child.props.onFocus?.(e);
              onFocus?.(e);
            };
            props.onBlur = (e) => {
              child.props.onBlur?.(e);
              onBlur?.(e);
            };
          }
          if (onClick) {
            props.onClick = (e) => {
              child.props.onClick?.(e);
              onClick?.(e);
            };
          }

          return React.cloneElement(child, {
            ...child.props,
            ...props,
            'aria-describedby': _id,
          });
        }

        return null;
      }}
      onVisibleChange={changeVisible}
    />
  );
};

export const DTooltip = React.forwardRef(Tooltip);
