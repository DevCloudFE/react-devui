import type { DIconBaseProps } from './useIconDefinition';

import React from 'react';

import { useIconProps } from './hooks';
import { useIconDefinition } from './useIconDefinition';

export type DCustomIconeProps = DIconBaseProps;

function CustomIcon(props: DCustomIconeProps, ref: React.ForwardedRef<SVGSVGElement>): JSX.Element | null {
  const { ...restProps } = useIconProps(props);

  const svgProps = useIconDefinition(restProps);

  return React.createElement('svg', { ref, ...svgProps }, svgProps.children);
}

export const DCustomIcon = React.forwardRef(CustomIcon);
