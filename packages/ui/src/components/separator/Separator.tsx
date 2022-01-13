import React from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export type DSeparatorRef = HTMLButtonElement;

export interface DSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  dTag?: string;
  dTextAlign?: 'left' | 'right' | 'center';
  dVertical?: boolean;
}

export function DSeparator(props: DSeparatorProps) {
  const {
    dTag = 'hr',
    dTextAlign = 'left',
    dVertical = false,
    className,
    children,
    ...restProps
  } = useComponentConfig(DSeparator.name, props);

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
