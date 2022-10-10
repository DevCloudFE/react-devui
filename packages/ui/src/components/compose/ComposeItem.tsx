import { getClassName } from '@react-devui/utils';

import { useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DComposeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dGray?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCompose.Item' as const });
export function DComposeItem(props: DComposeItemProps): JSX.Element | null {
  const {
    children,
    dGray = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  return (
    <DBaseDesign
      dComposeDesign={{
        disabled: true,
      }}
      dFormDesign={false}
    >
      {({ render: renderBaseDesign }) =>
        renderBaseDesign(
          <div
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}compose-item`, {
              [`${dPrefix}compose-item--${gSize}`]: gSize,
              [`${dPrefix}compose-item--gray`]: dGray,
              'is-disabled': gDisabled,
            })}
          >
            {children}
          </div>
        )
      }
    </DBaseDesign>
  );
}
