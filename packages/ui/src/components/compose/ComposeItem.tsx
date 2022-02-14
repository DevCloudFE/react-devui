import { usePrefixConfig, useComponentConfig, useGeneralState } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

const { COMPONENT_NAME } = generateComponentMate('DComposeItem');
export function DComposeItem(props: DComposeItemProps): JSX.Element | null {
  const { dGray = false, className, children, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

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
