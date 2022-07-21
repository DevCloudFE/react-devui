import type { DIconBaseProps } from './useIconDefinition';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types';

import { isUndefined, isArray } from 'lodash';
import React from 'react';

import { useComponentConfig, usePrefixConfig } from '../hooks';
import { useIconDefinition } from './useIconDefinition';

interface DRenderIconOptions {
  placeholders: {
    primaryColor: string;
    secondaryColor: string;
  };
  extraSVGAttrs?: React.SVGAttributes<SVGElement>;
}

function renderIconDefinition(icond: IconDefinition, options: DRenderIconOptions): JSX.Element {
  if (typeof icond.icon === 'function') {
    // two-tone
    const placeholders = options.placeholders;
    return renderAbstractNode(icond.icon(placeholders.primaryColor, placeholders.secondaryColor), options);
  }
  // fill, outline
  return renderAbstractNode(icond.icon, options);
}

function renderAbstractNode(node: AbstractNode, options: DRenderIconOptions): JSX.Element {
  const props: any = Object.assign(node.attrs, node.tag === 'svg' ? options.extraSVGAttrs ?? {} : {});
  const children = (node.children ?? []).map((child) => renderAbstractNode(child, options));

  return React.createElement(node.tag, props, ...children);
}

export interface DIconProps extends Omit<DIconBaseProps, 'children'> {
  dIcon: IconDefinition;
  dTwoToneColor?: string | [string, string];
}

export function DIcon(props: DIconProps): JSX.Element | null {
  const {
    dIcon,
    dTwoToneColor,
    dTheme,

    ...restProps
  } = useComponentConfig('DIcon', props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const svgProps = useIconDefinition(Object.assign(restProps, { dTheme }));

  const twoToneColor: DRenderIconOptions['placeholders'] = isUndefined(dTwoToneColor)
    ? {
        primaryColor: dTheme ? `var(--${dPrefix}color-${dTheme})` : `var(--${dPrefix}text-color)`,
        secondaryColor: dTheme ? `var(--${dPrefix}background-color-${dTheme})` : `rgb(var(--${dPrefix}text-color-rgb) / 10%)`,
      }
    : isArray(dTwoToneColor)
    ? { primaryColor: dTwoToneColor[0], secondaryColor: dTwoToneColor[1] }
    : { primaryColor: dTwoToneColor, secondaryColor: dTwoToneColor };

  return renderIconDefinition(dIcon, { placeholders: twoToneColor, extraSVGAttrs: svgProps });
}
