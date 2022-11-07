import { isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';

import { checkNodeExist, getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { DEmpty } from '../empty';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DTableEmptyProps extends React.HTMLAttributes<HTMLTableRowElement> {
  dColSpan?: number;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Empty' as const });
export function DTableEmpty(props: DTableEmptyProps): JSX.Element | null {
  const {
    children,
    dColSpan,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const tdRef = useRef<HTMLTableDataCellElement>(null);
  //#endregion

  useEffect(() => {
    if (isUndefined(dColSpan) && tdRef.current) {
      let tableEl = tdRef.current.parentElement;
      while (tableEl && tableEl.tagName.toLowerCase() !== 'table') {
        tableEl = tableEl.parentElement;
      }
      if (tableEl) {
        let colSpan = 0;
        const cells = (tableEl as HTMLTableElement).rows.item(0)?.cells;
        if (cells) {
          for (let index = 0; index < cells.length; index++) {
            colSpan += cells.item(index)!.colSpan ?? 1;
          }
          tdRef.current.colSpan = colSpan;
        }
      }
    }
  });

  return (
    <tr {...restProps} className={getClassName(restProps.className, `${dPrefix}table__empty`)}>
      <td ref={tdRef} colSpan={dColSpan}>
        <div className={`${dPrefix}table__empty-content`}>{checkNodeExist(children) ? children : <DEmpty></DEmpty>}</div>
      </td>
    </tr>
  );
}
