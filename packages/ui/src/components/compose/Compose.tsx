import type { DGeneralState, DSize } from '../../types';

import React, { useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralState, useForkRef } from '../../hooks';
import { DGeneralStateContext } from '../../hooks/state/useGeneralState';
import { registerComponentMate, getClassName } from '../../utils';

export type DComposeRef = HTMLDivElement;

export interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
  dSize?: DSize;
  dVertical?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCompose' });
function Compose(props: DComposeProps, ref: React.ForwardedRef<DComposeRef>) {
  const {
    className,
    role = 'group',
    disabled: _disabled,
    children,
    dSize,
    dVertical = false,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  const combineElRef = useForkRef(elRef, ref);

  const size = dSize ?? gSize;
  const disabled = _disabled || gDisabled;

  const generalStateContextValue = useMemo<DGeneralState>(
    () => ({
      gSize: size,
      gDisabled: disabled,
    }),
    [disabled, size]
  );

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <div
        {...restProps}
        ref={combineElRef}
        className={getClassName(className, `${dPrefix}compose`, {
          [`${dPrefix}compose--vertical`]: dVertical,
        })}
        role={role}
      >
        {children}
      </div>
    </DGeneralStateContext.Provider>
  );
}

export const DCompose = React.forwardRef(Compose);
