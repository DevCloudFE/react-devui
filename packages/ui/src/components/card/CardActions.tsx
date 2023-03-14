import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DSeparator } from '../separator';

export interface DCardActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dActions: React.ReactNode[];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard.Actions' as const });
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
      {React.Children.map(dActions, (action, index) => (
        <>
          {action}
          {index !== dActions.length - 1 && <DSeparator style={{ margin: 8 }} dVertical></DSeparator>}
        </>
      ))}
    </div>
  );
}
