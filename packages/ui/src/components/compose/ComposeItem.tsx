import { usePrefixConfig, useComponentConfig, useGeneralState } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { useCompose } from './hooks';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DComposeItem' });
export function DComposeItem(props: DComposeItemProps): JSX.Element | null {
  const { className, children, dGray = false, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const composeDataAttrs = useCompose(false, true);

  return (
    <div
      {...restProps}
      {...composeDataAttrs}
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
