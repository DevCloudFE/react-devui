import type { DBreakpoints } from './Row';

import { isNumber, isObject } from 'lodash';

import { usePrefixConfig, useComponentConfig, useGridConfig, useContextRequired } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DRowContext } from './Row';

export type DSpanValue = number | true;

export interface DColBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dSpan?: DSpanValue;
}
export interface DColProps extends DColBaseProps {
  dResponsiveProps?: Record<DBreakpoints, DSpanValue | DColBaseProps>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCol' });
export function DCol(props: DColProps) {
  const {
    children,
    dSpan,
    dResponsiveProps,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { colNum } = useGridConfig();
  const { gMediaMatch, gSpace } = useContextRequired(DRowContext);
  //#endregion

  const [span, responsiveProps] = (() => {
    let span = dSpan;
    let responsiveProps: DColBaseProps | undefined = undefined;
    if (dResponsiveProps) {
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
      style={{
        ...style,
        ...responsiveProps?.style,
        width: isNumber(span) ? `calc(100% / ${colNum} * ${span})` : undefined,
        flexGrow: span === true ? 1 : undefined,
        paddingLeft: gSpace,
        paddingRight: gSpace,
      }}
    >
      {children}
    </div>
  );
}
