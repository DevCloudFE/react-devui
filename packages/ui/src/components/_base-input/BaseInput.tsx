import type { DFormControl } from '../form';

import { isString } from 'lodash';
import React, { useContext, useId } from 'react';

import { usePrefixConfig } from '../../hooks';
import { DFormUpdateContext } from '../form';

export interface DBaseInputProps extends React.InputHTMLAttributes<any> {
  dFormControl?: DFormControl;
  dTag?: string;
  dFor?: boolean;
}

function BaseInput(props: DBaseInputProps, ref: React.ForwardedRef<any>): JSX.Element | null {
  const {
    dFormControl,
    dTag = 'input',
    dFor = true,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const updateForm = useContext(DFormUpdateContext);
  //#endregion

  const uniqueId = useId();
  const id = restProps.id ?? `${dPrefix}base-input-${uniqueId}`;

  const supportForm = updateForm && dFormControl;

  const attrs = supportForm
    ? {
        'data-form-label-for': dFor,
        ...dFormControl.inputAttrs,
      }
    : {};

  return React.createElement(dTag, {
    ...restProps,
    ...attrs,
    ref,
    id,
    'aria-describedby': [props['aria-describedby'], dFormControl?.inputAttrs?.['aria-describedby']]
      .filter((describedby) => isString(describedby))
      .join(' '),
  });
}

export const DBaseInput = React.forwardRef(BaseInput);
