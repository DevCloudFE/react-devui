import type { DId, DSize } from '../../utils/types';
import type { DFormControl } from '../form';
import type { DRadioPrivateProps } from './Radio';

import { isUndefined, nth } from 'lodash';
import React, { useEffect, useState } from 'react';

import { useId } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { DCompose } from '../compose';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DRadio } from './Radio';

export interface DRadioItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

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
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const uniqueId = useId();

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<V | null, V>(nth(dList, 0)?.value ?? null, dModel, onModelChange, undefined, formControlInject);

  const [isChange, setIsChange] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isChange) {
      setIsChange(false);
    }
  });

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return (
    <DCompose
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}radio-group`, {
        [`${dPrefix}radio-group--default`]: isUndefined(dType),
        'is-change': isChange,
      })}
      dDisabled={disabled}
      role="radiogroup"
      dSize={size}
      dVertical={dVertical}
    >
      {dList.map((item) =>
        React.cloneElement<DRadioPrivateProps>(
          <DRadio
            key={item.value}
            dModel={item.value === value}
            dDisabled={item.disabled}
            dInputRender={(el) =>
              cloneHTMLElement(el, {
                value: item.value,
                name: dName ?? uniqueId,
                ['data-form-item-label-for' as string]: item.value === value,
              })
            }
            onModelChange={() => {
              changeValue(item.value);
              setIsChange(true);
            }}
          >
            {item.label}
          </DRadio>,
          {
            __type: dType,
          }
        )
      )}
    </DCompose>
  );
}
