import type { DBreakpoints } from './Row';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export type DSpanValue = number | true;

export interface DColBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dSpan?: DSpanValue;
}
export interface DColProps extends DColBaseProps {
  dResponsiveProps?: Record<DBreakpoints, DSpanValue | DColBaseProps>;
}

export function DCol(props: DColProps) {
  const { dSpan, dResponsiveProps, className, children, ...restProps } = useComponentConfig(DCol.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}col`)}>
      {children}
    </div>
  );
}
