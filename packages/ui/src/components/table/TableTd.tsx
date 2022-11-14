import React from 'react';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCell } from './Cell';

export interface DTableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  dWidth?: number | string;
  dFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  dAlign?: 'left' | 'right' | 'center';
  dEllipsis?: boolean;
  dNowrap?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Td' as const });
export function DTableTd(props: DTableTdProps): JSX.Element | null {
  const {
    children,
    dWidth,
    dFixed,
    dAlign = 'left',
    dEllipsis = false,
    dNowrap = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DCell {...restProps} dTag="td" dWidth={dWidth} dFixed={dFixed} dAlign={dAlign} dEllipsis={dEllipsis}>
      {dNowrap ? children : <div className={`${dPrefix}table__cell-text`}>{children}</div>}
    </DCell>
  );
}
