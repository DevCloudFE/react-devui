import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DId, DSize } from '../../utils/global';
import type { DFormControl } from '../form';
import type { DRadioPropsWithPrivate } from './Radio';

import { isUndefined, nth } from 'lodash';
import React, { useEffect, useId, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralContext } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DCompose } from '../compose';
import { DRadio } from './Radio';

export interface DRadioOption<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dName?: string;
  dDisabled?: boolean;
  dOptions: DRadioOption<V>[];
  dModel?: [V | null, DUpdater<V>?];
  dType?: 'outline' | 'fill';
  dSize?: DSize;
  dVertical?: boolean;
  onModelChange?: (value: V) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadioGroup' });
export function DRadioGroup<V extends DId>(props: DRadioGroupProps<V>): JSX.Element | null {
  const {
    dName,
    dDisabled = false,
    dFormControl,
    dOptions,
    dModel,
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

  const [value, changeValue] = useTwoWayBinding<V | null, V>(nth(dOptions, 0)?.value ?? null, dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

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
            dDisabled: option.disabled,
            dModel: [option.value === value],
            dInputProps: {
              ...(option.value === value ? { id: getId(option.value), 'data-form-support-input': true } : undefined),
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
