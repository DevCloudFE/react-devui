import type { DFormControl } from '../form';

import { isString } from 'lodash';
import React, { useContext, useId } from 'react';

import { usePrefixConfig } from '../../hooks';
import { DFormContext } from '../form';

export interface DBaseInputProps extends React.InputHTMLAttributes<any> {
  dTag?: string;
  dFormControl?: DFormControl;
}

function BaseInput(props: DBaseInputProps, ref: React.ForwardedRef<any>) {
  const { dTag = 'input', dFormControl, ...restProps } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const formContext = useContext(DFormContext);
  //#endregion

  const uniqueId = useId();
  const id = `${dPrefix}base-input-${uniqueId}`;

  const supportForm = formContext && dFormControl;

  const attrs = supportForm
    ? {
        'data-form-support-input': true,
        ...dFormControl.inputAttrs,
      }
    : {};

  return React.createElement(dTag, {
    ...restProps,
    ...attrs,
    ref: ref,
    id: props.id ?? id,
    'aria-describedby': [props['aria-describedby'], dFormControl?.inputAttrs?.['aria-describedby']]
      .filter((describedby) => isString(describedby))
      .join(' '),
  });
}

export const DBaseInput = React.forwardRef(BaseInput);
