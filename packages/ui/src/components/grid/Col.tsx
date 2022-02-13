import type { DBreakpoints } from './Row';

import { isNumber, isObject } from 'lodash';

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
  const [{ gMediaMatch, gSpace }] = useCustomContext(DRowContext);
  //#endregion

  const [span, responsiveProps] = (() => {
    let span = dSpan;
    let responsiveProps: DColBaseProps | undefined = undefined;
    if (gMediaMatch && dResponsiveProps) {
      for (const breakpoint of gMediaMatch) {
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
  })();

  return (
    <div
      {...restProps}
      {...responsiveProps}
      className={getClassName(className, responsiveProps?.className, `${dPrefix}col`)}
      style={mergeStyle(
        {
          width: isNumber(span) ? `calc(100% / ${colNum} * ${span})` : undefined,
          flexGrow: span === true ? 1 : undefined,
          paddingLeft: gSpace,
          paddingRight: gSpace,
        },
        style,
        responsiveProps?.style
      )}
    >
      {children}
    </div>
  );
}
