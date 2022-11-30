import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';
import { useComponentConfig } from '../root';

export interface DModalFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | boolean | Promise<boolean>;
  onOkClick?: () => void | boolean | Promise<boolean>;
}

export interface DModalFooterPrivateProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DModal.Footer' as const });
export function DModalFooter(props: DModalFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dActions = ['cancel', 'ok'],
    dCancelProps,
    dOkProps,
    onCancelClick,
    onOkClick,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DModalFooterProps & DModalFooterPrivateProps);

  return (
    <DFooter
      {...restProps}
      dClassNamePrefix="modal"
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
