import type { DSize } from '../../utils/global';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralContext } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { convertHex, registerComponentMate, getClassName, pSBC } from '../../utils';

export interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: DSize;
  dClosable?: boolean;
  onClose?: React.MouseEventHandler<HTMLSpanElement>;
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
    onClose,

    className,
    style,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const size = dSize ?? gDisabled;

  const [t] = useTranslation();

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
              [`--${dPrefix}tag-background-color`]: convertHex(dColor, 0.1),
            }
          : {}),
      }}
    >
      {children}
      {dClosable && (
        <button className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tag__close`)} aria-label={t('Close')} onClick={onClose}>
          <CloseOutlined />
        </button>
      )}
    </div>
  );
}
