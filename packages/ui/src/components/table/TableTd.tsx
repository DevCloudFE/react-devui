import React from 'react';

import { useComponentConfig, usePrefixConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DCell } from './Cell';
import { DTable } from './Table';

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
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Td' });
export function DTableTd(props: DTableTdProps): JSX.Element | null {
  const {
    children,
    dWidth,
    dFixed,
    dAlign = 'left',
    dEllipsis = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  let nestedTable = false;
  if (React.isValidElement(children) && children.type === DTable) {
    nestedTable = true;
  }

  return (
    <DCell {...restProps} dTag="td" dWidth={dWidth} dFixed={dFixed} dAlign={dAlign} dEllipsis={dEllipsis}>
      {nestedTable ? children : <div className={`${dPrefix}table__cell-text`}>{children}</div>}
    </DCell>
  );
}
