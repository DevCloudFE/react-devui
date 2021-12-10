import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { getClassName } from '../../utils';
import { useCompose } from './utils';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

export function DComposeItem(props: DComposeItemProps) {
  const { dGray = false, className, children, ...restProps } = useComponentConfig(DComposeItem.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { composeSize, composeDisabled } = useCompose();
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}compose-item`, {
        [`${dPrefix}compose-item--${composeSize}`]: composeSize,
        [`${dPrefix}compose-item--gray`]: dGray,
        'is-disabled': composeDisabled,
      })}
    >
      {children}
    </div>
  );
}
