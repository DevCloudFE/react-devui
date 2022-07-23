import React from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DSeparator } from '../separator';

export interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
  dActions?: React.ReactNode[];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard' });
export function DCard(props: DCardProps): JSX.Element | null {
  const {
    children,
    dBorder = true,
    dShadow = false,
    dActions,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}card`, {
        [`${dPrefix}card--border`]: dBorder,
        [`${dPrefix}card--shadow`]: dShadow === true,
        [`${dPrefix}card--shadow-hover`]: dShadow === 'hover',
      })}
    >
      {children}
      {dActions && (
        <div className={`${dPrefix}card__actions`}>
          {React.Children.map(dActions as any[], (action, index) => (
            <>
              {React.cloneElement(action, {
                ...action.props,
                className: getClassName(action.props.className, `${dPrefix}card__action`),
              })}
              {index !== dActions.length - 1 && <DSeparator className={`${dPrefix}card__action-separator`} dVertical></DSeparator>}
            </>
          ))}
        </div>
      )}
    </div>
  );
}
