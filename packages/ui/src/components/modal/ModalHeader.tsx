import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';
import { useComponentConfig } from '../root';

export interface DModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | boolean | Promise<boolean>;
}

export interface DModalHeaderPrivateProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal.Header' as const });
export function DModalHeader(props: DModalHeaderProps): JSX.Element | null {
  const {
    dActions = ['close'],
    dCloseProps,
    onCloseClick,
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalHeaderProps & DModalHeaderPrivateProps);

  return (
    <DHeader
      {...restProps}
      dClassNamePrefix="modal"
      dActions={dActions}
      dCloseProps={dCloseProps}
      dAriaLabelledby={__id}
      onCloseClick={onCloseClick}
      onClose={__onClose}
    ></DHeader>
  );
}
