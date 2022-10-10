import React from 'react';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCell } from './Cell';

export interface DTableTdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  dText?: boolean;
  dWidth?: number | string;
  dFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  dAlign?: 'left' | 'right' | 'center';
  dEllipsis?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Td' as const });
export function DTableTd(props: DTableTdProps): JSX.Element | null {
  const {
    children,
    dText = true,
    dWidth,
    dFixed,
    dAlign = 'left',
    dEllipsis = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DCell {...restProps} dTag="td" dWidth={dWidth} dFixed={dFixed} dAlign={dAlign} dEllipsis={dEllipsis}>
      {dText ? <div className={`${dPrefix}table__cell-text`}>{children}</div> : children}
    </DCell>
  );
}
