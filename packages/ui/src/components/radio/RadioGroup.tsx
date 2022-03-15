import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DSize, DId } from '../../types';
import type { DFormControl } from '../form';
import type { DRadioPropsWithPrivate } from './Radio';

import { isUndefined, nth } from 'lodash';
import React, { useId, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useAsync } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DCompose } from '../compose';
import { DRadio } from './Radio';

export interface DRadioOption<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export interface DRadioGroupProps<V extends DId> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  name?: string;
  disabled?: boolean;
  dFormControl?: DFormControl;
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
    className,
    name,
    disabled: _disabled,
    dFormControl,
    dOptions,
    dModel,
    dType,
    dSize,
    dVertical = false,
    onModelChange,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const groupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

  const uniqueId = useId();

  const [value, _changeValue] = useTwoWayBinding<V | null, V>(nth(dOptions, 0)?.value ?? null, dModel, onModelChange, {
    formControl: dFormControl?.control,
  });
  const changeValue = (val: V) => {
    _changeValue(val);

    if (groupRef.current) {
      groupRef.current.classList.toggle('is-change', true);

      dataRef.current.clearTid?.();
      dataRef.current.clearTid = asyncCapture.afterNextAnimationFrame(() => {
        if (groupRef.current) {
          groupRef.current.classList.toggle('is-change', false);
        }
      });
    }
  };

  const size = dSize ?? gSize;
  const disabled = _disabled || gDisabled || dFormControl?.disabled;

  return (
    <DCompose
      {...restProps}
      {...dFormControl?.dataAttrs}
      ref={groupRef}
      className={getClassName(className, `${dPrefix}radio-group`, {
        [`${dPrefix}radio-group--default`]: isUndefined(dType),
      })}
      disabled={disabled}
      role="radiogroup"
      dSize={size}
      dVertical={dVertical}
    >
      {dOptions.map((option) =>
        React.createElement<DRadioPropsWithPrivate>(
          DRadio,
          {
            key: option.value,
            disabled: option.disabled,
            dModel: [option.value === value],
            dInputProps: {
              ...(option.value === value ? { ...dFormControl?.inputAttrs, id: dFormControl?.controlId } : undefined),
              name: name ?? uniqueId,
              value: option.value,
            },
            onModelChange: () => {
              changeValue(option.value);
            },
            __type: dType,
          },
          option.label
        )
      )}
    </DCompose>
  );
}
