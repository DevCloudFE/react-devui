import { isUndefined, isNumber, isArray } from 'lodash';

import { getClassName } from '@react-devui/utils';

import { useIconContext } from './hooks';

export interface DIconBaseProps extends React.SVGAttributes<SVGElement> {
  dSize?: number | string | [number | string, number | string];
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dRotate?: number;
  dSpin?: boolean;
  dSpinSpeed?: number | string;
}

export function useIconDefinition(props: DIconBaseProps) {
  const {
    dSize = '1em',
    dTheme,
    dRotate,
    dSpin,
    dSpinSpeed = 1,

    ...restProps
  } = props;

  const context = useIconContext();

  const [width, height] = isArray(dSize) ? dSize : [dSize, dSize];

  const svgProps: React.SVGAttributes<SVGElement> = {
    ...restProps,
    className: getClassName(restProps.className, context.className(dTheme)),
    style: {
      ...restProps.style,
      transform: isUndefined(dRotate) ? undefined : `rotate(${dRotate}deg)`,
      animation: dSpin ? `spin ${dSpinSpeed}${isNumber(dSpinSpeed) ? 's' : ''} linear infinite` : undefined,
    },
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    xmlnsXlink: 'http://www.w3.org/1999/xlink',
    fill: 'currentColor',
    width,
    height,
  };

  return svgProps;
}
