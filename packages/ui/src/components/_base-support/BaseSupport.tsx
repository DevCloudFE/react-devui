import type { DFormControl } from '../form';

import React, { useContext } from 'react';

import { DComposeContext } from '../compose';
import { DFormContext } from '../form';

export interface DBaseSupportProps {
  children: React.ReactElement;
  dCompose?: {
    active?: boolean;
    disabled?: boolean;
  };
  dFormControl?: DFormControl;
}

export function DBaseSupport(props: DBaseSupportProps): JSX.Element | null {
  const { children, dCompose, dFormControl } = props;

  const composeContext = useContext(DComposeContext);
  const formContext = useContext(DFormContext);

  const supportCompose = composeContext && dCompose;
  const supportForm = formContext && dFormControl;

  let dataAttrs: { [index: string]: boolean } = {};

  if (supportCompose) {
    dataAttrs = Object.assign(dataAttrs, {
      'data-compose-support': true,
      'data-compose-support-active': dCompose.active,
      'data-compose-support-disabled': dCompose.disabled,
    });
  }

  if (supportForm) {
    dataAttrs = Object.assign(dataAttrs, dFormControl.wrapperAttrs);
  }

  return React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
    ...children.props,
    ...dataAttrs,
  });
}
