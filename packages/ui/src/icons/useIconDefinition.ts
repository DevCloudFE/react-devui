import { isUndefined, isNumber } from 'lodash';

import { usePrefixConfig } from '../hooks';
import { getClassName } from '../utils';

export interface DIconBaseProps extends React.SVGAttributes<SVGElement> {
  dSize?: number | string;
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
    className,
    style,
    version = '1.1',
    xmlns = 'http://www.w3.org/2000/svg',
    xmlnsXlink = 'http://www.w3.org/1999/xlink',
    fill = 'currentColor',
    width,
    height,
    ...restProps
  } = props;

  const dPrefix = usePrefixConfig();

  const svgProps: React.SVGAttributes<SVGElement> = {
    ...restProps,
    className: getClassName(className, `${dPrefix}icon`, {
      [`t-${dTheme}`]: dTheme,
    }),
    style: {
      ...style,
      transform: isUndefined(dRotate) ? undefined : `rotate(${dRotate}deg)`,
      animation: dSpin ? `spin ${dSpinSpeed}${isNumber(dSpinSpeed) ? 's' : ''} linear infinite` : undefined,
    },
    version,
    xmlns,
    xmlnsXlink,
    fill,
    width: width ?? dSize,
    height: height ?? dSize,
  };

  return svgProps;
}
