import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';
import { useComponentConfig } from '../root';

export interface DPopoverHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | false | Promise<void | false>;
}

export interface DPopoverHeaderPrivateProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover.Header' as const });
export function DPopoverHeader(props: DPopoverHeaderProps): JSX.Element | null {
  const {
    dActions = [],
    dCloseProps,
    onCloseClick,
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DPopoverHeaderProps & DPopoverHeaderPrivateProps);

  return (
    <DHeader
      {...restProps}
      dClassNamePrefix="popover"
      dActions={dActions}
      dCloseProps={dCloseProps}
      dAriaLabelledby={__id}
      onCloseClick={onCloseClick}
      onClose={__onClose}
    ></DHeader>
  );
}
