import type { DSize } from '../../utils/types';

import { getClassName } from '@react-devui/utils';

import { useGeneralContext } from '../../hooks';
import { convertHex, registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: DSize;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTag' as const });
export function DTag(props: DTagProps): JSX.Element | null {
  const {
    children,
    dType = 'primary',
    dTheme,
    dColor,
    dSize,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize } = useGeneralContext();
  //#endregion

  const size = dSize ?? gSize;

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}tag`, `${dPrefix}tag--${dType}`, {
        [`${dPrefix}tag--${size}`]: size,
        [`t-${dTheme}`]: dTheme,
      })}
      style={{
        ...restProps.style,
        ...(dColor
          ? {
              [`--${dPrefix}tag-color`]: dColor,
              [`--${dPrefix}tag-background-color`]: convertHex(dColor, 0.1),
            }
          : {}),
      }}
    >
      {children}
    </div>
  );
}
