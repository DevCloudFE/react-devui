import type { DSize } from '../../utils/types';

import React, { useMemo } from 'react';

import { getClassName } from '@react-devui/utils';

import { useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DComposeItem } from './ComposeItem';

export interface DComposeContextData {
  gSize?: DSize;
  gDisabled?: boolean;
}
export const DComposeContext = React.createContext<DComposeContextData | null>(null);

export interface DComposeProps extends React.HTMLAttributes<HTMLDivElement> {
  dSize?: DSize;
  dVertical?: boolean;
  dDisabled?: boolean;
}

export interface DComposePrivateProps {
  __noStyle?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCompose' as const });
export const DCompose: {
  (props: DComposeProps): JSX.Element | null;
  Item: typeof DComposeItem;
} = (props) => {
  const {
    children,
    dSize,
    dVertical = false,
    dDisabled = false,
    __noStyle,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DComposeProps & DComposePrivateProps);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

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
        className={
          __noStyle
            ? restProps.className
            : getClassName(restProps.className, `${dPrefix}compose`, {
                [`${dPrefix}compose--vertical`]: dVertical,
              })
        }
        role="group"
      >
        {children}
      </div>
    </DComposeContext.Provider>
  );
};

DCompose.Item = DComposeItem;
