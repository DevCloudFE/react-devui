import type { DFormControl } from '../form';

import React, { useContext } from 'react';

import { DComposeContext } from '../compose';
import { DFormUpdateContext } from '../form';

export interface DBaseDesignProps {
  children: React.ReactElement;
  dCompose?: {
    active?: boolean;
    disabled?: boolean;
  };
  dFormControl?: DFormControl;
}

export function DBaseDesign(props: DBaseDesignProps): JSX.Element | null {
  const { children, dCompose, dFormControl } = props;

  const composeContext = useContext(DComposeContext);
  const updateForm = useContext(DFormUpdateContext);

  const supportCompose = composeContext && dCompose;
  const supportForm = updateForm && dFormControl;

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
