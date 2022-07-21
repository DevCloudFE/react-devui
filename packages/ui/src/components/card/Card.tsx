import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export interface DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  dBorder?: boolean;
  dShadow?: boolean | 'hover';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard' });
export function DCard(props: DCardProps): JSX.Element | null {
  const {
    children,
    dBorder = true,
    dShadow = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}card`, {
        [`${dPrefix}card--border`]: dBorder,
        [`${dPrefix}card--shadow`]: dShadow === true,
        [`${dPrefix}card--shadow-hover`]: dShadow === 'hover',
      })}
    >
      {children}
    </div>
  );
}
