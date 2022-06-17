import { usePrefixConfig, useTranslation } from '../../hooks';
import { CloseOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DButton } from '../button';

export interface DHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dClosable?: boolean;
  dExtraIcons?: React.ReactNode[];
  onClose?: () => void;
}

export function DHeader(props: DHeaderProps) {
  const {
    children,
    dClosable = true,
    dExtraIcons,
    onClose,

    className,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation('Common');

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}header`)}>
      <div className={`${dPrefix}header__title`}>{children}</div>
      <div className={`${dPrefix}header__buttons`}>
        {dExtraIcons && dExtraIcons.map((icon, index) => <DButton key={index} dType="text" dIcon={icon}></DButton>)}
        {dClosable && (
          <DButton
            aria-label={t('Close')}
            dType="text"
            dIcon={<CloseOutlined />}
            onClick={() => {
              onClose?.();
            }}
          ></DButton>
        )}
      </div>
    </div>
  );
}
