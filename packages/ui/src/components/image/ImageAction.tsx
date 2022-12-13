import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';

export type DImageActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DImage.Action' as const });
function ImageAction(props: DImageActionProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
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
      className={getClassName(restProps.className, `${dPrefix}image__action`)}
      type={restProps['type'] ?? 'button'}
    >
      {children}
    </button>
  );
}

export const DImageAction = React.forwardRef(ImageAction);
