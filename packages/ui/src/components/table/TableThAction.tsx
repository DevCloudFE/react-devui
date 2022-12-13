import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export type DTableThActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.ThAction' as const });
function CardAction(props: DTableThActionProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
  const {
    children,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <button
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}table__th-action`)}
      type={restProps['type'] ?? 'button'}
      onClick={(e) => {
        restProps.onClick?.(e);

        e.stopPropagation();
      }}
    >
      {children}
    </button>
  );
}

export const DTableThAction = React.forwardRef(CardAction);
