import type { DHeaderProps } from '../_header';

import { usePrefixConfig, useComponentConfig, useContextRequired } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DHeader } from '../_header';
import { DDrawerContext } from './Drawer';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'onClose'>;

const { COMPONENT_NAME } = generateComponentMate('DDrawerHeader');
export function DDrawerHeader(props: DDrawerHeaderProps): JSX.Element | null {
  const { className, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gId, gCloseDrawer } = useContextRequired(DDrawerContext);
  //#endregion

  const handleClose = () => {
    gCloseDrawer();
  };

  return (
    <DHeader
      {...restProps}
      id={`${dPrefix}drawer-header-${gId}`}
      className={getClassName(className, `${dPrefix}drawer-header`)}
      onClose={handleClose}
    ></DHeader>
  );
}
