import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DSeparator } from '../separator';
import { DCardContent } from './CardContent';
import { DCardHeader } from './CardHeader';

export interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
  dActions?: React.ReactNode[];
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard' as const });
export const DCard: {
  (props: DCardProps): JSX.Element | null;
  Header: typeof DCardHeader;
  Content: typeof DCardContent;
} = (props) => {
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
                className: getClassName(action.props.className, `${dPrefix}card__action`),
              })}
              {index !== dActions.length - 1 && <DSeparator style={{ margin: 8 }} dVertical></DSeparator>}
            </>
          ))}
        </div>
      )}
    </div>
  );
};

DCard.Header = DCardHeader;
DCard.Content = DCardContent;
