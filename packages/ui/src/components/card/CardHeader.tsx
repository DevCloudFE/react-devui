import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dAction?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard.Header' as const });
export function DCardHeader(props: DCardHeaderProps): JSX.Element | null {
  const {
    children,
    dAction,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}card__header`)}>
      <div className={`${dPrefix}card__header-title`}>{children}</div>
      <div className={`${dPrefix}card__header-action`}>{dAction}</div>
    </div>
  );
}
