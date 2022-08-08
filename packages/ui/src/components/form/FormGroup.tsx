import type { FormGroup } from './form-control';

import React from 'react';

import { useComponentConfig } from '../../hooks';
import { registerComponentMate } from '../../utils';

export const DFormGroupContext = React.createContext<FormGroup | null>(null);

export interface DFormGroupProps {
  children: React.ReactNode;
  dFormGroup: FormGroup;
  dTitle?: React.ReactNode;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DForm.Group' });
export function DFormGroup(props: DFormGroupProps): JSX.Element | null {
  const { children, dFormGroup, dTitle } = useComponentConfig(COMPONENT_NAME, props);

  return (
    <DFormGroupContext.Provider value={dFormGroup}>
      {dTitle}
      {children}
    </DFormGroupContext.Provider>
  );
}
