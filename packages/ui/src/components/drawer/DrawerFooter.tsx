import type { DButtonProps } from '../button';

import { registerComponentMate } from '../../utils';
import { DFooter } from '../_footer';
import { useComponentConfig } from '../root';

export interface DDrawerFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dAlign?: 'left' | 'center' | 'right';
  dActions?: React.ReactNode[];
  dCancelProps?: DButtonProps;
  dOkProps?: DButtonProps;
  onCancelClick?: () => void | false | Promise<void | false>;
  onOkClick?: () => void | false | Promise<void | false>;
}

export interface DDrawerFooterPrivateProps {
  __onClose?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDrawer.Footer' as const });
export function DDrawerFooter(props: DDrawerFooterProps): JSX.Element | null {
  const {
    dAlign = 'right',
    dActions = ['cancel', 'ok'],
    dCancelProps,
    dOkProps,
    onCancelClick,
    onOkClick,
    __onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DDrawerFooterProps & DDrawerFooterPrivateProps);

  return (
    <DFooter
      {...restProps}
      dClassNamePrefix="drawer"
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
