import type { DId, DSize } from '../../utils/global';
import type { DFormControl } from '../form';
import type { DRadioPropsWithPrivate } from './Radio';

import { isUndefined, nth } from 'lodash';
import React, { useEffect, useId, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DCompose } from '../compose';
import { useFormControl } from '../form';
import { DRadio } from './Radio';

export interface DRadioOption<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dModel?: V | null;
  dName?: string;
  dDisabled?: boolean;
  dOptions: DRadioOption<V>[];
  dType?: 'outline' | 'fill';
  dSize?: DSize;
  dVertical?: boolean;
  onModelChange?: (value: V) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadioGroup' });
export function DRadioGroup<V extends DId>(props: DRadioGroupProps<V>) {
  const {
    dFormControl,
    dModel,
    dName,
    dDisabled = false,
    dOptions,
    dType,
    dSize,
    dVertical = false,
    onModelChange,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const uniqueId = useId();
  const getId = (value: V) => `${dPrefix}radio-group-${value}-${uniqueId}`;

  const formControlInject = useFormControl(dFormControl);
  const [value, changeValue] = useDValue<V | null, V>(nth(dOptions, 0)?.value ?? null, dModel, onModelChange, undefined, formControlInject);

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
      className={getClassName(className, `${dPrefix}radio-group`, {
        [`${dPrefix}radio-group--default`]: isUndefined(dType),
        'is-change': isChange,
      })}
      dDisabled={disabled}
      role="radiogroup"
      dSize={size}
      dVertical={dVertical}
    >
      {dOptions.map((option) =>
        React.createElement<DRadioPropsWithPrivate>(
          DRadio,
          {
            key: option.value,
            dModel: option.value === value,
            dDisabled: option.disabled,
            dInputProps: {
              ...(option.value === value ? { id: getId(option.value), 'data-form-label-for': true } : undefined),
              name: dName ?? uniqueId,
              value: option.value,
            },
            onModelChange: () => {
              changeValue(option.value);
              setIsChange(true);
            },
            __type: dType,
          },
          option.label
        )
      )}
    </DCompose>
  );
}
