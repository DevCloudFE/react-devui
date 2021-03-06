import type { DSize } from '../../utils/global';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralContext } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { convertHex, registerComponentMate, getClassName, checkNodeExist } from '../../utils';

export interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: DSize;
  dIcon?: React.ReactNode;
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
    dIcon,
    dClosable = false,
    onClose,

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
      {checkNodeExist(dIcon) && <div className={`${dPrefix}tag__icon`}>{dIcon}</div>}
      {children}
      {dClosable && (
        <button className={`${dPrefix}tag__close`} aria-label={t('Close')} onClick={onClose}>
          <CloseOutlined />
        </button>
      )}
    </div>
  );
}
