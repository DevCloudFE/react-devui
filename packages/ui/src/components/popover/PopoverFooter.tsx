import type { DFooterProps } from '../_footer';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';

export type DPopoverFooterProps = Omit<DFooterProps, 'dClassNamePrefix' | 'onClose'>;

export interface DPopoverFooterPropsWithPrivate extends DPopoverFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover.Footer' as const });
export function DPopoverFooter(props: DPopoverFooterProps): JSX.Element | null {
  const {
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DPopoverFooterPropsWithPrivate);

  return <DFooter {...restProps} dClassNamePrefix="popover" onClose={__onClose}></DFooter>;
}
