import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCardAction } from './CardAction';
import { DCardActions } from './CardActions';
import { DCardContent } from './CardContent';
import { DCardHeader } from './CardHeader';

export interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard' as const });
export const DCard: {
  (props: DCardProps): JSX.Element | null;
  Actions: typeof DCardActions;
  Action: typeof DCardAction;
  Header: typeof DCardHeader;
  Content: typeof DCardContent;
} = (props) => {
  const {
    children,
    dBorder = true,
    dShadow = false,

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
    </div>
  );
};

DCard.Actions = DCardActions;
DCard.Action = DCardAction;
DCard.Header = DCardHeader;
DCard.Content = DCardContent;
