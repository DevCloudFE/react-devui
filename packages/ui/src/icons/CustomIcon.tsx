import type { DIconBaseProps } from './useIconDefinition';

import React from 'react';

import { useComponentConfig } from '../hooks';
import { useIconDefinition } from './useIconDefinition';

export function DCustomIcon(props: DIconBaseProps): JSX.Element | null {
  const _props = useComponentConfig('DIcon', props);

  const svgProps = useIconDefinition(_props);

  return React.createElement('svg', svgProps, svgProps.children);
}
