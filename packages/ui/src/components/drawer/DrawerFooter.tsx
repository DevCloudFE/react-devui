import type { DFooterProps } from '../_footer';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DFooter } from '../_footer';

export type DDrawerFooterProps = Omit<DFooterProps, 'onClose'>;

export interface DDrawerFooterPropsWithPrivate extends DDrawerFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawerFooter' });
export function DDrawerFooter(props: DDrawerFooterProps): JSX.Element | null {
  const {
    __onClose,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerFooterPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return <DFooter {...restProps} className={getClassName(className, `${dPrefix}drawer-footer`)} onClose={__onClose}></DFooter>;
}
