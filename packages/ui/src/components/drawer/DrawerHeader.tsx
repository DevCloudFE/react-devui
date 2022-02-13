import type { DHeaderProps } from '../_header';

import { usePrefixConfig, useComponentConfig, useCustomContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DHeader } from '../_header';
import { DDrawerContext } from './Drawer';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'onClose'>;

const { COMPONENT_NAME } = generateComponentMate('DDrawerHeader');
export function DDrawerHeader(props: DDrawerHeaderProps) {
  const { className, ...restProps } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gId, gCloseDrawer }] = useCustomContext(DDrawerContext);
  //#endregion

  const handleClose = () => {
    gCloseDrawer?.();
  };

  return (
    <DHeader
      {...restProps}
      id={gId ? `${dPrefix}drawer-header-${gId}` : undefined}
      className={getClassName(className, `${dPrefix}drawer-header`)}
      onClose={handleClose}
    ></DHeader>
  );
}
