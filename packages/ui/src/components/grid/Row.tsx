import { isArray, isNumber } from 'lodash';
import React, { useMemo } from 'react';

import { useMediaMatch } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGridConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export type DBreakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface DRowContextData {
  gMediaMatch: DBreakpoints[];
  gSpace: number | string;
}
export const DRowContext = React.createContext<DRowContextData | null>(null);

export type DGutterValue = number | string | [number | string, number | string];

export interface DRowProps extends React.HTMLAttributes<HTMLDivElement> {
  dGutter?: DGutterValue;
  dResponsiveGutter?: Partial<Record<DBreakpoints, DGutterValue>>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRow' });
export function DRow(props: DRowProps): JSX.Element | null {
  const {
    children,
    dGutter = 0,
    dResponsiveGutter,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dBreakpoints } = useGridConfig();
  //#endregion

  const mediaMatch = useMediaMatch(dBreakpoints);

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
      gMediaMatch: mediaMatch,
      gSpace: space,
    }),
    [mediaMatch, space]
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
