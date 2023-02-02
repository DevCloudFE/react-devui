import type { DFormProps } from '@react-devui/ui';

import React from 'react';

import { getClassName } from '@react-devui/utils';

export interface AppResponsiveFormProps {
  children: React.ReactElement;
}

export function AppResponsiveForm(props: AppResponsiveFormProps): JSX.Element | null {
  const { children } = props;

  return (
    <>
      {React.cloneElement<DFormProps>(children, {
        className: getClassName(children.props.className, 'd-md-none'),
        dLayout: 'vertical',
      })}
      {React.cloneElement<DFormProps>(children, {
        className: getClassName(children.props.className, 'd-none d-md-flex'),
        dLayout: 'horizontal',
      })}
    </>
  );
}
