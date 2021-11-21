import type { DHeaderProps } from '../_header';

import { useCallback } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext } from '../../hooks';
import { getClassName } from '../../utils';
import { DHeader } from '../_header';
import { DDrawerContext } from './Drawer';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'onClose'>;

export function DDrawerHeader(props: DDrawerHeaderProps) {
  const { className, ...restProps } = useDComponentConfig('drawer-header', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const { drawerId, closeDrawer } = useCustomContext(DDrawerContext);
  //#endregion

  const handleClose = useCallback(() => {
    closeDrawer?.();
  }, [closeDrawer]);

  return (
    <DHeader
      {...restProps}
      id={drawerId ? `${dPrefix}drawer-content__header-${drawerId}` : undefined}
      className={getClassName(className, `${dPrefix}drawer-content__header`)}
      onClose={handleClose}
    ></DHeader>
  );
}
