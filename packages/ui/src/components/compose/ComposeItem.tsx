import { usePrefixConfig, useComponentConfig, useGeneralContext } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DBaseDesign } from '../_base-design';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DComposeItem' });
export function DComposeItem(props: DComposeItemProps): JSX.Element | null {
  const { className, children, dGray = false, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  return (
    <DBaseDesign dCompose={{ disabled: true }}>
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
    </DBaseDesign>
  );
}
