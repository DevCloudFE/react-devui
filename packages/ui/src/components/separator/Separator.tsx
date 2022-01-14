import React from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export type DSeparatorRef = HTMLButtonElement;

export interface DSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  dTag?: string;
  dTextAlign?: 'left' | 'right' | 'center';
  dVertical?: boolean;
}

const { COMPONENT_NAME } = generateComponentMate('DSeparator');
export function DSeparator(props: DSeparatorProps) {
  const {
    dTag = 'hr',
    dTextAlign = 'left',
    dVertical = false,
    className,
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return React.createElement(
    children && dTag === 'hr' ? 'div' : dTag,
    {
      ...restProps,
      className: getClassName(className, `${dPrefix}separator`, {
        [`${dPrefix}separator--text-${dTextAlign}`]: children,
        [`${dPrefix}separator--vertical`]: dVertical,
      }),
      role: 'separator',
      'aria-orientation': dVertical ? 'vertical' : 'horizontal',
    },
    children ? <div className={`${dPrefix}separator__text`}>{children}</div> : null
  );
}
