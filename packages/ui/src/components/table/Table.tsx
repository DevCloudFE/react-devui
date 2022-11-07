import React, { useMemo, useRef, useState } from 'react';

import { useForkRef, useIsomorphicLayoutEffect } from '@react-devui/hooks';
import { getClassName, isSimpleArrayEqual } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DTableEmpty } from './TableEmpty';
import { DTableExpand } from './TableExpand';
import { DTableFilter } from './TableFilter';
import { DTableSearch } from './TableSearch';
import { DTableTd } from './TableTd';
import { DTableTh } from './TableTh';

export interface DTableContextData {
  gFixed: ('left' | 'right')[];
  gEllipsis: boolean;
}
export const DTableContext = React.createContext<DTableContextData | null>(null);

export interface DTableProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dEllipsis?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable' as const });
function Table(props: DTableProps, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null {
  const {
    children,
    dBorder = false,
    dEllipsis = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  const combineElRef = useForkRef(elRef, ref);
  //#endregion

  const [fixed, setFixed] = useState<('left' | 'right')[]>([]);

  const getFixed = (el: HTMLDivElement) => {
    const scrollLeft = el.scrollLeft;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    let newFixed: ('left' | 'right')[] = [];
    if (maxScrollLeft === 0) {
      newFixed = [];
    } else if (scrollLeft === 0) {
      newFixed = ['right'];
    } else if (Math.ceil(scrollLeft) >= maxScrollLeft) {
      newFixed = ['left'];
    } else {
      newFixed = ['left', 'right'];
    }

    if (!isSimpleArrayEqual(newFixed, fixed)) {
      setFixed(newFixed);
    }
  };
  useIsomorphicLayoutEffect(() => {
    if (elRef.current) {
      getFixed(elRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo<DTableContextData>(
    () => ({
      gFixed: fixed,
      gEllipsis: dEllipsis,
    }),
    [dEllipsis, fixed]
  );

  return (
    <DTableContext.Provider value={contextValue}>
      <div
        {...restProps}
        ref={combineElRef}
        className={getClassName(restProps.className, `${dPrefix}table`, {
          [`${dPrefix}table--border`]: dBorder,
        })}
        onScroll={(e) => {
          restProps.onScroll?.(e);

          getFixed(e.currentTarget);
        }}
      >
        {children}
      </div>
    </DTableContext.Provider>
  );
}

export const DTable: {
  (props: DTableProps & React.RefAttributes<HTMLDivElement>): ReturnType<typeof Table>;
  Th: typeof DTableTh;
  Td: typeof DTableTd;
  Empty: typeof DTableEmpty;
  Filter: typeof DTableFilter;
  Search: typeof DTableSearch;
  Expand: typeof DTableExpand;
} = React.forwardRef(Table) as any;

DTable.Th = DTableTh;
DTable.Td = DTableTd;
DTable.Empty = DTableEmpty;
DTable.Filter = DTableFilter;
DTable.Search = DTableSearch;
DTable.Expand = DTableExpand;
