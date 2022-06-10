import type { DFooterProps } from '../_footer';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DFooter } from '../_footer';

export type DModalFooterProps = Omit<DFooterProps, 'onClose'>;

export interface DModalFooterPropsWithPrivate extends DModalFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModalFooter' });
export function DModalFooter(props: DModalFooterProps): JSX.Element | null {
  const {
    __onClose,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalFooterPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return <DFooter {...restProps} className={getClassName(className, `${dPrefix}modal-footer`)} onClose={__onClose}></DFooter>;
}
