import { isNumber, isUndefined } from 'lodash';
import React, { useEffect, useRef } from 'react';

import { getClassName } from '@react-devui/utils';

import { useContextRequired } from '../../hooks';
import { usePrefixConfig } from '../root';
import { DTableContext } from './Table';

const ZINDEX_CONFIG = {
  top: 5,
  right: 1,
  bottom: 5,
  left: 1,
};

export interface DCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  dTag: 'th' | 'td';
  dWidth: number | string | undefined;
  dFixed:
    | {
        top?: number | string;
        right?: number | string;
        bottom?: number | string;
        left?: number | string;
      }
    | undefined;
  dAlign: 'left' | 'right' | 'center';
  dEllipsis: boolean;
  dNowrap: boolean;
}

export function DCell(props: DCellProps): JSX.Element | null {
  const {
    children,
    dTag,
    dWidth,
    dFixed,
    dAlign,
    dEllipsis,
    dNowrap,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gFixed, gEllipsis } = useContextRequired(DTableContext);
  //#endregion

  //#region Ref
  const cellRef = useRef<HTMLTableCellElement>(null);
  //#endregion

  const ellipsis = gEllipsis || dEllipsis;

  let fixedLeft = false;
  let fixedRight = false;
  let fixedStyle = {};
  if (dFixed) {
    fixedStyle = {
      ...dFixed,
      position: 'sticky',
      zIndex: Object.keys(dFixed).reduce((previous, current) => previous + ZINDEX_CONFIG[current], 0),
    };

    if ('left' in dFixed) {
      fixedLeft = true;
    }
    if ('right' in dFixed) {
      fixedRight = true;
    }
  }

  useEffect(() => {
    if (cellRef.current && cellRef.current.parentElement) {
      let showShadow = false;
      if (fixedLeft && gFixed.includes('left')) {
        const elsL = cellRef.current.parentElement.querySelectorAll(`.${dPrefix}table__cell--fixed-left`);
        if (elsL.item(elsL.length - 1) === cellRef.current) {
          showShadow = true;
        }
      }

      if (fixedRight && gFixed.includes('right')) {
        const elsR = cellRef.current.parentElement.querySelectorAll(`.${dPrefix}table__cell--fixed-right`);
        if (elsR.item(0) === cellRef.current) {
          showShadow = true;
        }
      }

      cellRef.current.classList.toggle(`${dPrefix}table__cell--fixed-shadow`, showShadow);
    }
  });

  return React.createElement(
    dTag,
    {
      ...restProps,
      ref: cellRef,
      className: getClassName(restProps.className, `${dPrefix}table__cell`, `${dPrefix}table__cell--${dAlign}`, {
        [`${dPrefix}table__cell--fixed-left`]: fixedLeft,
        [`${dPrefix}table__cell--fixed-right`]: fixedRight,
        [`${dPrefix}table__cell--ellipsis`]: ellipsis,
        [`${dPrefix}table__cell--nowrap`]: dNowrap,
      }),
      style: {
        ...restProps.style,
        ...fixedStyle,
        width: isUndefined(dWidth) ? undefined : dWidth,
      },
    },
    <div
      className={`${dPrefix}table__cell-content`}
      style={{
        width: isUndefined(dWidth)
          ? undefined
          : `calc(${dWidth + (isNumber(dWidth) ? 'px' : '')} - var(--${dPrefix}table-padding-size) * 2)`,
      }}
    >
      {children}
    </div>
  );
}
