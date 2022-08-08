import type { DHeaderProps } from '../_header';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';

export type DDrawerHeaderProps = Omit<DHeaderProps, 'dClassNamePrefix' | 'onClose'>;

export interface DDrawerHeaderPropsWithPrivate extends DDrawerHeaderProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawer.Header' });
export function DDrawerHeader(props: DDrawerHeaderProps): JSX.Element | null {
  const {
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerHeaderPropsWithPrivate);

  return <DHeader {...restProps} dClassNamePrefix="drawer" dTitleId={restProps.dTitleId ?? __id} onClose={__onClose}></DHeader>;
}
