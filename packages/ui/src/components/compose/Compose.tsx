import type { DSize } from '../../utils/types';

import React, { useMemo, useRef } from 'react';

import { useForkRef } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DComposeItem } from './ComposeItem';

export interface DComposeContextData {
  gSize?: DSize;
  gDisabled?: boolean;
}
export const DComposeContext = React.createContext<DComposeContextData | null>(null);

export type DComposeRef = HTMLDivElement;

export interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: DSize;
  dVertical?: boolean;
  dDisabled?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCompose' as const });
function Compose(props: DComposeProps, ref: React.ForwardedRef<DComposeRef>): JSX.Element | null {
  const {
    children,
    dSize,
    dVertical = false,
    dDisabled = false,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const elRef = useRef<HTMLDivElement>(null);
  //#endregion

  const combineElRef = useForkRef(elRef, ref);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled;

  const contextValue = useMemo<DComposeContextData>(
    () => ({
      gSize: size,
      gDisabled: disabled,
    }),
    [disabled, size]
  );

  return (
    <DComposeContext.Provider value={contextValue}>
      <div
        {...restProps}
        ref={combineElRef}
        className={getClassName(restProps.className, `${dPrefix}compose`, {
          [`${dPrefix}compose--vertical`]: dVertical,
        })}
        role={restProps.role ?? 'group'}
      >
        {children}
      </div>
    </DComposeContext.Provider>
  );
}

export const DCompose: {
  (props: DComposeProps & React.RefAttributes<DComposeRef>): ReturnType<typeof Compose>;
  Item: typeof DComposeItem;
} = React.forwardRef(Compose) as any;

DCompose.Item = DComposeItem;
