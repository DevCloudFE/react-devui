import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export type DCardContentProps = React.HTMLAttributes<HTMLDivElement>;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard.Content' as const });
export function DCardContent(props: DCardContentProps): JSX.Element | null {
  const {
    children,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div {...restProps} className={getClassName(restProps.className, `${dPrefix}card__content`)}>
      {children}
    </div>
  );
}
