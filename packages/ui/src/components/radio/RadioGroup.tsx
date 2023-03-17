import type { DId, DSize } from '../../utils/types';
import type { DFormControl } from '../form';
import type { DRadioPrivateProps } from './Radio';
import type { DRadioItem } from './RadioGroupRenderer';

import { isUndefined } from 'lodash';
import React, { useEffect, useState } from 'react';

import { getClassName } from '@react-devui/utils';

import { useGeneralContext } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DCompose } from '../compose';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DRadioGroupRenderer } from './RadioGroupRenderer';

export interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: DRadioItem<V>[];
  dModel?: V | null;
  dName?: string;
  dDisabled?: boolean;
  dType?: 'outline' | 'fill';
  dSize?: DSize;
  dVertical?: boolean;
  onModelChange?: (value: V) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadio.Group' as const });
export function DRadioGroup<V extends DId>(props: DRadioGroupProps<V>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dName,
    dDisabled = false,
    dType,
    dSize,
    dVertical = false,
    onModelChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize } = useGeneralContext();
  //#endregion

  const [isChange, setIsChange] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isChange) {
      setIsChange(false);
    }
  });

  const size = dSize ?? gSize;

  return (
    <DRadioGroupRenderer
      dFormControl={dFormControl}
      dList={dList}
      dModel={dModel}
      dName={dName}
      dDisabled={dDisabled}
      dRender={(nodes) => (
        <DCompose
          {...restProps}
          className={getClassName(restProps.className, `${dPrefix}radio-group`, {
            [`${dPrefix}radio-group--default`]: isUndefined(dType),
            [`${dPrefix}radio-group--vertical`]: dVertical,
            'is-change': isChange,
          })}
          role="radiogroup"
          dSize={size}
          dVertical={dVertical}
          {...({ __noStyle: isUndefined(dType) } as any)}
        >
          {React.Children.map(nodes, (node) =>
            React.cloneElement<DRadioPrivateProps>(node, {
              __type: dType,
            })
          )}
        </DCompose>
      )}
      onModelChange={onModelChange}
    />
  );
}
