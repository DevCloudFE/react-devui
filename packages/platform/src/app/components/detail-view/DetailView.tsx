import { isArray, isNull, isNumber, isString, isUndefined } from 'lodash';
import React from 'react';

import { getClassName } from '@react-devui/utils';

export interface AppDetailViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  aList: {
    label: string;
    content: React.ReactNode;
    isEmpty?: boolean;
    center?: boolean;
  }[];
  aCol?: number | true | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl', number | true>>;
  aGutter?: number | [number?, number?];
  aLabelAlign?: 'left' | 'center' | 'right';
  aLabelWidth?: string | number;
  aEmpty?: React.ReactNode;
  aVertical?: boolean;
}

export function AppDetailView(props: AppDetailViewProps): JSX.Element | null {
  const {
    aList,
    aCol = { xs: 12, md: 6, lg: 4, xxl: 3 },
    aGutter,
    aLabelAlign = 'left',
    aLabelWidth,
    aEmpty = '-',
    aVertical = false,

    ...restProps
  } = props;

  const [gutterY, gutterX] = isArray(aGutter) ? aGutter : [aGutter, aGutter];
  const col = (() => {
    if (aCol === true) {
      return 'col';
    }
    if (isNumber(aCol)) {
      return `col-${aCol}`;
    }

    const classNames: string[] = [];
    Object.entries(aCol).forEach(([breakpoint, col]) => {
      const className: (string | number)[] = ['col'];
      if (breakpoint !== 'xs') {
        className.push(breakpoint);
      }
      if (col !== true) {
        className.push(col);
      }
      classNames.push(className.join('-'));
    });
    return classNames.join(' ');
  })();

  const labelWidth = (() => {
    if (aVertical) {
      return undefined;
    }

    let maxLength = 0;
    if (aList) {
      aList.forEach((item) => {
        maxLength = Math.max(item.label.length, maxLength);
      });
    }

    return isUndefined(aLabelWidth) ? maxLength + 1 + 'em' : aLabelWidth;
  })();

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, 'app-detail-view', 'row', {
        'app-detail-view--vertical': aVertical,
        [`gx-${gutterX}`]: gutterX,
        [`gy-${gutterY}`]: gutterY,
      })}
    >
      {aList.map(({ label, content: _content, isEmpty: _isEmpty, center }) => {
        const isEmpty = isUndefined(_isEmpty)
          ? (isString(_content) && _content.length === 0) || isUndefined(_content) || isNull(_content)
          : _isEmpty;
        const content = isEmpty ? aEmpty : _content;

        return (
          <div
            key={label}
            className={getClassName('app-detail-view__item', col, {
              'app-detail-view__item--center': !aVertical && center,
            })}
          >
            <div
              className="app-detail-view__item-label"
              style={{
                width: labelWidth,
                textAlign: aLabelAlign,
              }}
            >
              {label}
            </div>
            <div className="app-detail-view__item-content">{content}</div>
          </div>
        );
      })}
    </div>
  );
}
