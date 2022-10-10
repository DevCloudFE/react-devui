import React from 'react';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  dTextAlign?: 'left' | 'right' | 'center';
  dVertical?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSeparator' as const });
export function DSeparator(props: DSeparatorProps): JSX.Element | null {
  const {
    children,
    dTextAlign = 'left',
    dVertical = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}separator`, {
        [`${dPrefix}separator--text`]: children,
        [`${dPrefix}separator--text-${dTextAlign}`]: children,
        [`${dPrefix}separator--vertical`]: dVertical,
      })}
      role="separator"
      aria-orientation={dVertical ? 'vertical' : 'horizontal'}
    >
      {checkNodeExist(children) && <div className={`${dPrefix}separator__text`}>{children}</div>}
    </div>
  );
}
