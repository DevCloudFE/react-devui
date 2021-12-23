import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralState } from '../../hooks';
import { getClassName, pSBC } from '../../utils';
import { DIcon } from '../icon';

export interface DTagProps extends React.HTMLAttributes<HTMLDivElement> {
  dType?: 'primary' | 'fill' | 'outline';
  dTheme?: 'primary' | 'success' | 'warning' | 'danger';
  dColor?: string;
  dSize?: 'smaller' | 'larger';
  dClosable?: boolean;
  onClose?: React.MouseEventHandler<HTMLSpanElement>;
}

export function DTag(props: DTagProps) {
  const {
    dType = 'primary',
    dTheme,
    dColor,
    dSize,
    dClosable = false,
    onClose,
    className,
    children,
    onClick,
    ...restProps
  } = useComponentConfig(DTag.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralState();
  //#endregion

  const size = dSize ?? gDisabled;

  const [t] = useTranslation('Common');

  const handleCloseClick = useCallback(
    (e) => {
      onClose?.(e);
    },
    [onClose]
  );

  return (
    <div
      {...restProps}
      className={getClassName(className, `${dPrefix}tag`, `${dPrefix}tag--${dType}`, {
        [`${dPrefix}tag--${size}`]: size,
        [`t-${dTheme}`]: dTheme,
      })}
      style={
        dColor
          ? {
              [`--${dPrefix}tag-color`]: dColor,
              [`--${dPrefix}tag-border-color`]: pSBC(0.3, dColor),
              [`--${dPrefix}tag-background-color`]: pSBC(0.92, dColor),
            }
          : undefined
      }
    >
      {children}
      {dClosable && (
        <span className={`${dPrefix}tag__close`} role="button" tabIndex={-1} aria-label={t('Close')} onClick={handleCloseClick}>
          <DIcon viewBox="64 64 896 896">
            <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
          </DIcon>
        </span>
      )}
    </div>
  );
}
