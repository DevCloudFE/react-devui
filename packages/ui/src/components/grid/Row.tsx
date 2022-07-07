import { isArray, isNumber } from 'lodash';
import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { useMediaMatch } from './hooks';

export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface DRowContextData {
  gMediaMatch: DBreakpoints[];
  gSpace: number | string;
}
export const DRowContext = React.createContext<DRowContextData | null>(null);

export type DGutterValue = number | string | [number | string, number | string];

export interface DRowProps extends React.HTMLAttributes<HTMLDivElement> {
  dGutter?: DGutterValue;
  dResponsiveGutter?: Record<DBreakpoints, DGutterValue>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRow' });
export function DRow(props: DRowProps): JSX.Element | null {
  const {
    children,
    dGutter = 0,
    dResponsiveGutter,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const mediaMatch = useMediaMatch();

  const gap = (() => {
    const getGap = (gutter: DGutterValue): [number | string, number | string] => {
      if (isArray(gutter)) {
        return [gutter[0], gutter[1]];
      }
      return [gutter, gutter];
    };

    let gap = getGap(dGutter);

    if (dResponsiveGutter) {
      for (const breakpoint of mediaMatch) {
        if (breakpoint in dResponsiveGutter) {
          gap = getGap(dResponsiveGutter[breakpoint]);
          break;
        }
      }
    }

    return gap;
  })();
  const space = isNumber(gap[1]) ? gap[1] / 2 : `calc(${gap[1]} / 2)`;

  const contextValue = useMemo<DRowContextData>(
    () => ({
      gMediaMatch: mediaMatch,
      gSpace: space,
    }),
    [mediaMatch, space]
  );

  return (
    <DRowContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}row`)}
        style={{
          ...style,
          rowGap: gap[0],
          marginLeft: isNumber(space) ? -space : `calc(${space} * -1)`,
          marginRight: isNumber(space) ? -space : `calc(${space} * -1)`,
        }}
      >
        {children}
      </div>
    </DRowContext.Provider>
  );
}
