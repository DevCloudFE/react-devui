import type { DId } from '../../utils/types';
import type { DFormControl } from '../form';

import { nth } from 'lodash';
import React, { useEffect, useState } from 'react';

import { useId } from '@react-devui/hooks';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate } from '../../utils';
import { useFormControl } from '../form';
import { useComponentConfig } from '../root';
import { DRadio } from './Radio';

export interface DRadioItem<V extends DId> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
}

export interface DRadioGroupRendererProps<V extends DId> {
  dFormControl?: DFormControl;
  dList: DRadioItem<V>[];
  dModel?: V | null;
  dName?: string;
  dVerticalCenter?: boolean;
  dDisabled?: boolean;
  dRender: (nodes: React.ReactElement[]) => JSX.Element | null;
  onModelChange?: (value: V) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DRadio.GroupRenderer' as const });
export function DRadioGroupRenderer<V extends DId>(props: DRadioGroupRendererProps<V>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dName,
    dVerticalCenter = false,
    dDisabled = false,
    dRender,
    onModelChange,
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const { gDisabled } = useGeneralContext();
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

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  return dRender(
    dList.map((item) =>
      React.cloneElement(
        <DRadio
          key={item.value}
          dModel={item.value === value}
          dVerticalCenter={dVerticalCenter}
          dDisabled={item.disabled || disabled}
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
        </DRadio>
      )
    )
  );
}
