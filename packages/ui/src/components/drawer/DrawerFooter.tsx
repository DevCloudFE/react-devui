import type { DFooterProps } from '../_footer';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';

export type DDrawerFooterProps = Omit<DFooterProps, 'dClassNamePrefix' | 'onClose'>;

export interface DDrawerFooterPropsWithPrivate extends DDrawerFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawer.Footer' as const });
export function DDrawerFooter(props: DDrawerFooterProps): JSX.Element | null {
  const {
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerFooterPropsWithPrivate);

  return <DFooter {...restProps} dClassNamePrefix="drawer" onClose={__onClose}></DFooter>;
}
