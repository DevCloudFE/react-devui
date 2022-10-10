import type { DCloneHTMLElement } from '../../utils/types';
import type { DFormControl } from '../form';

import { isString } from 'lodash';
import { useContext } from 'react';

import { useId } from '@react-devui/hooks';

import { cloneHTMLElement } from '../../utils';
import { DFormUpdateContext } from '../form';

export interface DBaseInputProps {
  children: (props: { render: DCloneHTMLElement }) => JSX.Element | null;
  dFormControl: DFormControl | undefined;
  dLabelFor: boolean;
}

export function DBaseInput(props: DBaseInputProps): JSX.Element | null {
  const { children, dFormControl, dLabelFor } = props;

  //#region Context
  const updateForm = useContext(DFormUpdateContext);
  //#endregion

  const uniqueId = useId();

  const supportForm = updateForm && dFormControl;

  const attrs = supportForm
    ? {
        'data-form-item-label-for': dLabelFor,
        ...dFormControl.inputAttrs,
      }
    : {};

  return children({
    render: (el) =>
      cloneHTMLElement(el, {
        ...attrs,
        id: el.props.id ?? (dLabelFor ? `form-item-label-for-${uniqueId}` : undefined),
        'aria-describedby': [el.props['aria-describedby'], dFormControl?.inputAttrs?.['aria-describedby']]
          .filter((describedby) => isString(describedby))
          .join(' '),
      }),
  });
}
