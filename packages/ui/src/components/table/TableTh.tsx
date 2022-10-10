import { isUndefined } from 'lodash';
import React from 'react';

import { CaretDownOutlined, CaretUpOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DCell } from './Cell';

export interface DTableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  dWidth?: number | string;
  dSort?: {
    options?: ('ascend' | 'descend' | null)[];
    active?: 'ascend' | 'descend' | null;
    onSort?: (order: 'ascend' | 'descend' | null) => void;
  };
  dActions?: React.ReactNode[];
  dFixed?: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  dAlign?: 'left' | 'right' | 'center';
  dEllipsis?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Th' as const });
export function DTableTh(props: DTableThProps): JSX.Element | null {
  const {
    children,
    dWidth,
    dSort,
    dActions = [],
    dFixed,
    dAlign = 'left',
    dEllipsis = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [sort, changeSort] = useDValue<'ascend' | 'descend' | null>(null, dSort?.active, dSort?.onSort);

  return (
    <DCell
      {...restProps}
      className={getClassName(restProps.className, {
        [`${dPrefix}table__cell--th-empty`]: !checkNodeExist(children),
        [`${dPrefix}table__cell--th-sort`]: dSort,
      })}
      aria-sort={sort === 'ascend' ? 'ascending' : sort === 'descend' ? 'descending' : undefined}
      onClick={() => {
        if (dSort) {
          const sortOptions = dSort.options ?? [null, 'ascend', 'descend'];
          changeSort((draft) => sortOptions[(sortOptions.findIndex((order) => order === draft) + 1) % sortOptions.length]);
        }
      }}
      dTag="th"
      dWidth={dWidth}
      dFixed={dFixed}
      dAlign={dAlign}
      dEllipsis={dEllipsis}
    >
      <div className={`${dPrefix}table__cell-text`}>{children}</div>
      {(dSort || dActions.length > 0) && (
        <div className={`${dPrefix}table__th-actions`} aria-hidden>
          {dSort && (
            <button className={getClassName(`${dPrefix}table__th-action`, `${dPrefix}table__th-action--sort`)}>
              {(isUndefined(dSort.options) || dSort.options.includes('ascend')) && (
                <CaretUpOutlined
                  className={getClassName(`${dPrefix}table__th-sort-icon`, {
                    'is-active': sort === 'ascend',
                  })}
                />
              )}
              {(isUndefined(dSort.options) || dSort.options.includes('descend')) && (
                <CaretDownOutlined
                  className={getClassName(`${dPrefix}table__th-sort-icon`, {
                    'is-active': sort === 'descend',
                  })}
                />
              )}
            </button>
          )}
          {React.Children.map(dActions as any[], (action) =>
            React.cloneElement(action, {
              className: getClassName(action.props.className, `${dPrefix}table__th-action`),
              onClick: (e: React.MouseEvent) => {
                action.props.onClick?.(e);

                e.stopPropagation();
              },
            })
          )}
        </div>
      )}
    </DCell>
  );
}
