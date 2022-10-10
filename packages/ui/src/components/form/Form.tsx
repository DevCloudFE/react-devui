import type { DSize } from '../../utils/types';

import React from 'react';

import { getClassName } from '@react-devui/utils';

import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DFormGroup } from './FormGroup';
import { DFormItem } from './FormItem';
import { DFormUpdateContext } from './hooks';

export interface DFormContextData {
  gLabelWidth: NonNullable<DFormProps['dLabelWidth']>;
  gLabelColon: NonNullable<DFormProps['dLabelColon']>;
  gRequiredType: NonNullable<DFormProps['dRequiredType']>;
  gLayout: NonNullable<DFormProps['dLayout']>;
  gInlineSpan: NonNullable<DFormProps['dInlineSpan']>;
  gFeedbackIcon: NonNullable<DFormProps['dFeedbackIcon']>;
  gSize?: DSize;
}
export const DFormContext = React.createContext<DFormContextData | null>(null);

export interface DFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  dUpdate: () => void;
  dLabelWidth?: number | string;
  dLabelColon?: boolean;
  dRequiredType?: 'required' | 'optional' | 'hidden';
  dLayout?: 'horizontal' | 'vertical' | 'inline';
  dInlineSpan?: number | true;
  dFeedbackIcon?:
    | boolean
    | {
        success?: React.ReactNode;
        warning?: React.ReactNode;
        error?: React.ReactNode;
        pending?: React.ReactNode;
      };
  dSize?: DSize;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DForm' as const });
export const DForm: {
  (props: DFormProps): JSX.Element | null;
  Group: typeof DFormGroup;
  Item: typeof DFormItem;
} = (props) => {
  const {
    children,
    dUpdate,
    dLabelWidth,
    dLabelColon,
    dRequiredType = 'required',
    dLayout = 'horizontal',
    dInlineSpan = 6,
    dFeedbackIcon = false,
    dSize,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  return (
    <DFormContext.Provider
      value={{
        gLabelWidth: dLabelWidth ?? (dLayout === 'vertical' ? '100%' : 150),
        gLabelColon: dLabelColon ?? (dLayout === 'vertical' ? false : true),
        gRequiredType: dRequiredType,
        gLayout: dLayout,
        gInlineSpan: dInlineSpan,
        gFeedbackIcon: dFeedbackIcon,
        gSize: dSize,
      }}
    >
      <DFormUpdateContext.Provider value={dUpdate}>
        <form
          {...restProps}
          className={getClassName(restProps.className, `${dPrefix}form`, {
            [`${dPrefix}form--${dSize}`]: dSize,
            [`${dPrefix}form--${dLayout}`]: dLayout,
          })}
          autoComplete={restProps.autoComplete ?? 'off'}
          onSubmit={(e) => {
            restProps.onSubmit?.(e);

            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {children}
        </form>
      </DFormUpdateContext.Provider>
    </DFormContext.Provider>
  );
};

DForm.Group = DFormGroup;
DForm.Item = DFormItem;
