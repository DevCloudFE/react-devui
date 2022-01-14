import type { DBreakpoints } from './Row';

import { isNumber, isObject } from 'lodash';
import { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useGridConfig } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';
import { DRowContext } from './Row';

export type DSpanValue = number | true;

export interface DColBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dSpan?: DSpanValue;
}
export interface DColProps extends DColBaseProps {
  dResponsiveProps?: Record<DBreakpoints, DSpanValue | DColBaseProps>;
}

const { COMPONENT_NAME } = generateComponentMate('DCol');
export function DCol(props: DColProps) {
  const { dSpan, dResponsiveProps, className, style, children, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { colNum } = useGridConfig();
  const [{ rowMediaMatch, rowSpace }] = useCustomContext(DRowContext);
  //#endregion

  const [span, responsiveProps] = useMemo<[DSpanValue?, React.HTMLAttributes<HTMLDivElement>?]>(() => {
    let span = dSpan;
    let responsiveProps: DColBaseProps | undefined = undefined;
    if (rowMediaMatch && dResponsiveProps) {
      for (const breakpoint of rowMediaMatch) {
        if (breakpoint in dResponsiveProps) {
          const data = dResponsiveProps[breakpoint];
          if (isObject(data)) {
            responsiveProps = { ...data };
            span = responsiveProps.dSpan;
            delete responsiveProps.dSpan;
          } else {
            span = data;
          }
          break;
        }
      }
    }

    return [span, responsiveProps];
  }, [dResponsiveProps, dSpan, rowMediaMatch]);

  return (
    <div
      {...restProps}
      {...responsiveProps}
      className={getClassName(className, responsiveProps?.className, `${dPrefix}col`)}
      style={mergeStyle(style, responsiveProps?.style, {
        width: isNumber(span) ? `calc(100% / ${colNum} * ${span})` : undefined,
        flexGrow: span === true ? 1 : undefined,
        paddingLeft: rowSpace,
        paddingRight: rowSpace,
      })}
    >
      {children}
    </div>
  );
}
