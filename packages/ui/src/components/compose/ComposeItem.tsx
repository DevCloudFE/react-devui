import { usePrefixConfig, useComponentConfig, useGeneralState } from '../../hooks';
import { getClassName } from '../../utils';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

export function DComposeItem(props: DComposeItemProps) {
  const { dGray = false, className, children, ...restProps } = useComponentConfig(DComposeItem.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}compose-item`, {
        [`${dPrefix}compose-item--${gSize}`]: gSize,
        [`${dPrefix}compose-item--gray`]: dGray,
        'is-disabled': gDisabled,
      })}
    >
      {children}
    </div>
  );
}
