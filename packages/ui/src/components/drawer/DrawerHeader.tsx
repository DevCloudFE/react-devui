import type { DHeaderProps } from '../_header';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DHeader } from '../_header';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'onClose'>;

export interface DDrawerHeaderPropsWithPrivate extends DDrawerHeaderProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawerHeader' });
export function DDrawerHeader(props: DDrawerHeaderProps) {
  const {
    __id,
    __onClose,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerHeaderPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return <DHeader {...restProps} id={__id} className={getClassName(className, `${dPrefix}drawer-header`)} onClose={__onClose}></DHeader>;
}
