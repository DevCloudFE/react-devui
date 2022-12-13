import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export type DCardActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCard.Action' as const });
function CardAction(props: DCardActionProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
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
      className={getClassName(restProps.className, `${dPrefix}card__action`)}
      type={restProps['type'] ?? 'button'}
    >
      {children}
    </button>
  );
}

export const DCardAction = React.forwardRef(CardAction);
