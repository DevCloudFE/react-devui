import type { AbstractControl } from './abstract-control';
import type { FormGroup } from './form-group';

import React from 'react';

import { registerComponentMate } from '../../utils';
import { useComponentConfig } from '../root';

export const DFormGroupContext = React.createContext<FormGroup | null>(null);

export interface DFormGroupProps {
  children: React.ReactNode;
  dFormGroup: AbstractControl;
  dTitle?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DForm.Group' as const });
export function DFormGroup(props: DFormGroupProps): JSX.Element | null {
  const { children, dFormGroup, dTitle } = useComponentConfig(COMPONENT_NAME, props);

  return (
    <DFormGroupContext.Provider value={dFormGroup as any as FormGroup}>
      {dTitle}
      {children}
    </DFormGroupContext.Provider>
  );
}
