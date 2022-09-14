import { isArray, isNumber } from 'lodash';
import React, { useMemo } from 'react';

import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useMediaQuery } from '../../hooks';
import { registerComponentMate } from '../../utils';

export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface DRowContextData {
  gBreakpointsMatched: DBreakpoints[];
  gSpace: number | string;
}
export const DRowContext = React.createContext<DRowContextData | null>(null);

export type DGutterValue = number | string | [number | string, number | string];

export interface DRowProps extends React.HTMLAttributes<HTMLDivElement> {
  dGutter?: DGutterValue;
  dResponsiveGutter?: Partial<Record<DBreakpoints, DGutterValue>>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRow' as const });
export function DRow(props: DRowProps): JSX.Element | null {
  const {
    children,
    dGutter = 0,
    dResponsiveGutter,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const breakpointsMatched = useMediaQuery();

  const gap = (() => {
    const getGap = (gutter: DGutterValue): [number | string, number | string] => {
      if (isArray(gutter)) {
        return [gutter[0], gutter[1]];
      }
      return [gutter, gutter];
    };

    let gap = getGap(dGutter);

    if (dResponsiveGutter) {
      for (const breakpoint of breakpointsMatched) {
        if (breakpoint in dResponsiveGutter) {
          gap = getGap(dResponsiveGutter[breakpoint]!);
          break;
        }
      }
    }

    return gap;
  })();
  const space = isNumber(gap[1]) ? gap[1] / 2 : `calc(${gap[1]} / 2)`;

  const contextValue = useMemo<DRowContextData>(
    () => ({
      gBreakpointsMatched: breakpointsMatched,
      gSpace: space,
    }),
    [breakpointsMatched, space]
  );

  return (
    <DRowContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(restProps.className, `${dPrefix}row`)}
        style={{
          ...restProps.style,
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
