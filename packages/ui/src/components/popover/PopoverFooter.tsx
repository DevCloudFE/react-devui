import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';
import { useComponentConfig } from '../root';

export interface DPopoverFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | boolean | Promise<boolean>;
  onOkClick?: () => void | boolean | Promise<boolean>;
}

export interface DPopoverFooterPrivateProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DPopover.Footer' as const });
export function DPopoverFooter(props: DPopoverFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dActions = ['cancel', 'ok'],
    dCancelProps,
    dOkProps,
    onCancelClick,
    onOkClick,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DPopoverFooterProps & DPopoverFooterPrivateProps);

  return (
    <DFooter
      {...restProps}
      dClassNamePrefix="popover"
      dAlign={dAlign}
      dActions={dActions}
      dCancelProps={dCancelProps}
      dOkProps={dOkProps}
      onCancelClick={onCancelClick}
      onOkClick={onOkClick}
      onClose={__onClose}
    ></DFooter>
  );
}
