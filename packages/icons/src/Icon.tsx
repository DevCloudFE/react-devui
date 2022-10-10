import type { DIconBaseProps } from './useIconDefinition';
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/es/types';

import React, { useContext } from 'react';

import { useIconDefinition } from './useIconDefinition';
import { useIconProps } from './useIconProps';

interface DRenderIconOptions {
  placeholders: {
    primaryColor: string;
    secondaryColor: string;
  };
  extraSVGAttrs?: React.SVGAttributes<SVGElement> & { ref: React.ForwardedRef<SVGSVGElement> };
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

export interface DIconContextData {
  props?: Omit<DIconProps, 'dIcon'>;
  namespace: string;
  twoToneColor: (theme?: DIconProps['dTheme']) => [string, string];
}
export const DIconContext = React.createContext<DIconContextData>({
  namespace: 'd',
  twoToneColor: (theme) => [
    theme ? `var(--d-color-${theme})` : `var(--d-text-color)`,
    theme ? `var(--d-background-color-${theme})` : `rgb(var(--d-text-color-rgb) / 10%)`,
  ],
});

export interface DIconProps extends Omit<DIconBaseProps, 'children'> {
  dTwoToneColor?: [string, string];
  dIcon: IconDefinition;
}

function Icon(props: DIconProps, ref: React.ForwardedRef<SVGSVGElement>): JSX.Element | null {
  const {
    dTheme,
    dTwoToneColor,
    dIcon,

    ...restProps
  } = useIconProps(props);

  const twoToneColorByTheme = useContext(DIconContext).twoToneColor;
  const twoToneColor = dTwoToneColor ?? twoToneColorByTheme(dTheme);

  const svgProps = useIconDefinition({ ...restProps, dTheme });

  return renderIconDefinition(dIcon, {
    placeholders: {
      primaryColor: twoToneColor[0],
      secondaryColor: twoToneColor[1],
    },
    extraSVGAttrs: { ref, ...svgProps },
  });
}

export const DIcon = React.forwardRef(Icon);
