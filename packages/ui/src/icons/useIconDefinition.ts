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

    ...restProps
  } = props;

  const dPrefix = usePrefixConfig();

  const svgProps: React.SVGAttributes<SVGElement> = {
    ...restProps,
    className: getClassName(restProps.className, `${dPrefix}icon`, {
      [`t-${dTheme}`]: dTheme,
    }),
    style: {
      ...restProps.style,
      transform: isUndefined(dRotate) ? undefined : `rotate(${dRotate}deg)`,
      animation: dSpin ? `spin ${dSpinSpeed}${isNumber(dSpinSpeed) ? 's' : ''} linear infinite` : undefined,
    },
    version: restProps.version ?? '1.1',
    xmlns: restProps.xmlns ?? 'http://www.w3.org/2000/svg',
    xmlnsXlink: restProps.xmlnsXlink ?? 'http://www.w3.org/1999/xlink',
    fill: restProps.fill ?? 'currentColor',
    width: restProps.width ?? dSize,
    height: restProps.height ?? dSize,
  };

  return svgProps;
}
