import { isUndefined } from 'lodash';

import { usePrefixConfig, useComponentConfig, useTranslation } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';

export interface DEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  dIcon?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DEmpty' });
export function DEmpty(props: DEmptyProps): JSX.Element | null {
  const {
    children,
    dIcon,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div {...restProps} className={getClassName(className, `${dPrefix}empty`)}>
      {isUndefined(dIcon) ? null : dIcon}
      {isUndefined(children) ? <div className={`${dPrefix}empty__description`}>{t('No Data')}</div> : children}
    </div>
  );
}
