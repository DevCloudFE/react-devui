import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DHeader } from '../_header';
import { useComponentConfig } from '../root';

export interface DDrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  dActions?: React.ReactNode[];
  dCloseProps?: DButtonProps;
  onCloseClick?: () => void | false | Promise<void | false>;
}

export interface DDrawerHeaderPrivateProps {
  __id?: string;
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawer.Header' as const });
export function DDrawerHeader(props: DDrawerHeaderProps): JSX.Element | null {
  const {
    dActions = ['close'],
    dCloseProps,
    onCloseClick,
    __id,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerHeaderProps & DDrawerHeaderPrivateProps);

  return (
    <DHeader
      {...restProps}
      dClassNamePrefix="drawer"
      dActions={dActions}
      dCloseProps={dCloseProps}
      dAriaLabelledby={__id}
      onCloseClick={onCloseClick}
      onClose={__onClose}
    ></DHeader>
  );
}
