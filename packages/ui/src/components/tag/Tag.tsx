import type { DSize } from '../../types';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralState, useThemeConfig } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { convertHex, registerComponentMate, getClassName, pSBC } from '../../utils';

export interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: DSize;
  dClosable?: boolean;
  onCloseClick?: React.MouseEventHandler<HTMLSpanElement>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTag' });
export function DTag(props: DTagProps): JSX.Element | null {
  const {
    children,
    dType = 'primary',
    dTheme,
    dColor,
    dSize,
    dClosable = false,
    onCloseClick,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const theme = useThemeConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const size = dSize ?? gDisabled;

  const [t] = useTranslation('Common');

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}tag`, `${dPrefix}tag--${dType}`, {
        [`${dPrefix}tag--${size}`]: size,
        [`t-${dTheme}`]: dTheme,
      })}
      style={{
        ...style,
        ...(dColor
          ? {
              [`--${dPrefix}tag-color`]: dColor,
              [`--${dPrefix}tag-border-color`]: pSBC(0.3, dColor),
              [`--${dPrefix}tag-background-color`]: convertHex(dColor, theme === 'light' ? 0.1 : 0.16),
            }
          : {}),
      }}
    >
      {children}
      {dClosable && (
        <button className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tag__close`)} aria-label={t('Close')} onClick={onCloseClick}>
          <CloseOutlined />
        </button>
      )}
    </div>
  );
}
