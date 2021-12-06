import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';

export type DSpanValue = number | true;

export interface DColBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  dSpan?: DSpanValue;
}
export interface DColProps extends DColBaseProps {
  xs?: DSpanValue | DColBaseProps;
  sm?: DSpanValue | DColBaseProps;
  md?: DSpanValue | DColBaseProps;
  lg?: DSpanValue | DColBaseProps;
  xl?: DSpanValue | DColBaseProps;
  xxl?: DSpanValue | DColBaseProps;
}

export function DCol(props: DColProps) {
  const { dSpan, xs, sm, md, lg, xl, xxl, className, children, ...restProps } = useComponentConfig(DCol.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}col`)}>
      {children}
    </div>
  );
}
