import type { DBreakpoints } from './Row';

import { isNumber, isObject } from 'lodash';

import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGridConfig, useContextRequired } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DRowContext } from './Row';

export type DSpanValue = number | true;

export interface DColBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dSpan?: DSpanValue;
}
export interface DColProps extends DColBaseProps {
  dResponsiveProps?: Partial<Record<DBreakpoints, DSpanValue | DColBaseProps>>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCol' });
export function DCol(props: DColProps): JSX.Element | null {
  const {
    children,
    dSpan,
    dResponsiveProps,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dColNum } = useGridConfig();
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

  return dSpan === 0 ? null : (
    <div
      {...restProps}
      {...responsiveProps}
      className={getClassName(restProps.className, responsiveProps?.className, `${dPrefix}col`)}
      style={{
        ...restProps.style,
        ...responsiveProps?.style,
        width: isNumber(span) ? `calc(100% / ${dColNum} * ${span})` : undefined,
        flexGrow: span === true ? 1 : undefined,
        paddingLeft: gSpace,
        paddingRight: gSpace,
      }}
    >
      {children}
    </div>
  );
}
