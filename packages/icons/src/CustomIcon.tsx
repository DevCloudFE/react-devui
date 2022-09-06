import type { DIconBaseProps } from './useIconDefinition';

import React from 'react';

import { useIconDefinition } from './useIconDefinition';
import { useIconProps } from './useIconProps';

export type DCustomIconeProps = DIconBaseProps;

export function DCustomIcon(props: DCustomIconeProps): JSX.Element | null {
  const { ...restProps } = useIconProps(props);

  const svgProps = useIconDefinition(restProps);

  return React.createElement('svg', svgProps, svgProps.children);
}
