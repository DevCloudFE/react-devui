import { isUndefined, isNumber, isArray } from 'lodash';
import React, { useMemo, useContext } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { DConfigContext } from '../../hooks/d-config';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';

export interface DIconProps extends React.SVGAttributes<SVGElement> {
  dName?: string;
  dType?: string;
  dSize?: number | string | [number | string, number | string];
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dRotate?: number;
  dSpin?: boolean;
  dSpinSpeed?: number | string;
}

const { COMPONENT_NAME } = generateComponentMate('DIcon');
export function DIcon(props: DIconProps) {
  const dPrefix = usePrefixConfig();
  const {
    dName,
    dType,
    dSize = '1em',
    dTheme,
    dRotate,
    dSpin,
    dSpinSpeed = 1,
    className,
    style,
    viewBox,
    fill = 'currentColor',
    children,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  const iconContext = useContext(DConfigContext).icons;

  const [_viewBox, paths] = useMemo(() => {
    if (!children && isArray(iconContext)) {
      if (isUndefined(dName)) {
        throw new Error('Missing `dName` prop');
      }
      const list = iconContext.find((icon) => icon.name === dName)?.list;
      if (isUndefined(list)) {
        throw new Error(`name '${dName}' dont exist`);
      } else {
        const icon = list.find((icon) => icon.type === dType);
        if (isUndefined(icon)) {
          throw new Error(`type '${dType}' dont exist in '${dName}'`);
        } else {
          return [icon.viewBox, icon.paths.map((path) => <path key={path} d={path}></path>)] as const;
        }
      }
    }

    return [];
  }, [iconContext, dName, dType, children]);

  const width = isArray(dSize) ? dSize[0] : dSize;
  const height = isArray(dSize) ? dSize[1] : dSize;

  return (
    <svg
      {...restProps}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={_viewBox ?? viewBox}
      fill={fill}
      width={width}
      height={height}
      className={getClassName(className, `${dPrefix}icon`, {
        [`t-${dTheme}`]: dTheme,
      })}
      style={mergeStyle(style, {
        transform: !isUndefined(dRotate) ? `rotate(${dRotate}deg)` : undefined,
        animation: dSpin === true ? `spin ${dSpinSpeed}${isNumber(dSpinSpeed) ? 's' : ''} linear infinite` : undefined,
      })}
    >
      {paths ?? children}
    </svg>
  );
}
