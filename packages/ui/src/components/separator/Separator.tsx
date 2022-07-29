import { isUndefined } from 'lodash';
import React from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export type DSeparatorRef = HTMLButtonElement;

export interface DSeparatorProps extends React.HTMLAttributes<HTMLElement> {
  dTag?: string;
  dTextAlign?: 'left' | 'right' | 'center';
  dVertical?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSeparator' });
export function DSeparator(props: DSeparatorProps): JSX.Element | null {
  const {
    children,
    dTag = 'hr',
    dTextAlign = 'left',
    dVertical = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return React.createElement(
    !isUndefined(children) && dTag === 'hr' ? 'div' : dTag,
    {
      ...restProps,
      className: getClassName(restProps.className, `${dPrefix}separator`, {
        [`${dPrefix}separator--text`]: children,
        [`${dPrefix}separator--text-${dTextAlign}`]: children,
        [`${dPrefix}separator--vertical`]: dVertical,
      }),
      role: restProps.role ?? 'separator',
      'aria-orientation': restProps['aria-orientation'] ?? (dVertical ? 'vertical' : 'horizontal'),
    },
    children ? <div className={`${dPrefix}separator__text`}>{children}</div> : null
  );
}
