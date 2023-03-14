import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export type DCardActionProps = React.ButtonHTMLAttributes<HTMLDivElement>;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard.Action' as const });
function CardAction(props: DCardActionProps, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element | null {
  const {
    children,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <div
      {...restProps}
      ref={ref}
      className={getClassName(restProps.className, `${dPrefix}card__action`)}
      role={restProps['role'] ?? 'button'}
      tabIndex={restProps['tabIndex'] ?? 0}
    >
      {children}
    </div>
  );
}

export const DCardAction = React.forwardRef(CardAction);
