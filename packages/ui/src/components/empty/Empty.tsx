import { checkNodeExist, getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';

export interface DEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  dIcon?: React.ReactNode;
  dDescription?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DEmpty' as const });
export function DEmpty(props: DEmptyProps): JSX.Element | null {
  const {
    children,
    dIcon,
    dDescription,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const [t] = useTranslation();

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}empty`)}>
      {checkNodeExist(dIcon) ? dIcon : null}
      <div className={`${dPrefix}empty__description`}>{checkNodeExist(dDescription) ? dDescription : t('No Data')}</div>
      {children}
    </div>
  );
}
