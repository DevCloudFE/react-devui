import React from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DSeparator } from '../separator';

export interface DCardActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dActions: React.ReactElement<React.ButtonHTMLAttributes<HTMLButtonElement>>[];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCardActions' });
export function DCardActions(props: DCardActionsProps): JSX.Element | null {
  const {
    dActions,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}card__actions`)}>
      {dActions.map((action, index) => (
        <React.Fragment key={index}>
          {React.cloneElement(action, {
            ...action.props,
            className: getClassName(action.props.className, `${dPrefix}card__action`),
          })}
          {index !== dActions.length - 1 && <DSeparator className={`${dPrefix}card__action-separator`} dVertical></DSeparator>}
        </React.Fragment>
      ))}
    </div>
  );
}
