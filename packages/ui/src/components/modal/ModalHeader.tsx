import type { DHeaderProps } from '../_header';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';

export type DModalHeaderProps = Omit<DHeaderProps, 'dClassNamePrefix' | 'onClose'>;

export interface DModalHeaderPropsWithPrivate extends DModalHeaderProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal.Header' as const });
export function DModalHeader(props: DModalHeaderProps): JSX.Element | null {
  const {
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalHeaderPropsWithPrivate);

  return <DHeader {...restProps} dClassNamePrefix="modal" dTitleId={restProps.dTitleId ?? __id} onClose={__onClose}></DHeader>;
}
