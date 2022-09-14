import type { DFooterProps } from '../_footer';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';

export type DModalFooterProps = Omit<DFooterProps, 'dClassNamePrefix' | 'onClose'>;

export interface DModalFooterPropsWithPrivate extends DModalFooterProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal.Footer' as const });
export function DModalFooter(props: DModalFooterProps): JSX.Element | null {
  const {
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalFooterPropsWithPrivate);

  return <DFooter {...restProps} dClassNamePrefix="modal" onClose={__onClose}></DFooter>;
}
