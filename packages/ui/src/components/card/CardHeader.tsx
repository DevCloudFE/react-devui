import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export interface DCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dAction?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCardHeader' });
export function DCardHeader(props: DCardHeaderProps): JSX.Element | null {
  const {
    children,
    dAction,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}card__header`)}>
      <div className={`${dPrefix}card__header-title`}>{children}</div>
      <div className={`${dPrefix}card__header-action`}>{dAction}</div>
    </div>
  );
}
