import type { DHeaderProps } from '../_header';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';

export type DPopoverHeaderProps = Omit<DHeaderProps, 'dClassNamePrefix' | 'onClose'>;

export interface DPopoverHeaderPropsWithPrivate extends DPopoverHeaderProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover.Header' as const });
export function DPopoverHeader(props: DPopoverHeaderProps): JSX.Element | null {
  const {
    dActions = [],
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DPopoverHeaderPropsWithPrivate);

  return (
    <DHeader
      {...restProps}
      dClassNamePrefix="popover"
      dTitleId={restProps.dTitleId ?? __id}
      dActions={dActions}
      onClose={__onClose}
    ></DHeader>
  );
}
