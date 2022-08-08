import type { DSize } from '../../utils/global';
import type { DBreakpoints } from '../grid';
import type { DFormInstance } from './hooks';

import { isUndefined } from 'lodash';
import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { useMediaMatch } from '../grid';
import { DFormGroup, DFormGroupContext } from './FormGroup';
import { DFormItem } from './FormItem';

export interface DFormContextData {
  gInstance: DFormInstance;
  gBreakpointMatchs: DBreakpoints[];
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
  dForm: DFormInstance;
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
  dResponsiveProps?: Record<DBreakpoints, Pick<DFormProps, 'dLabelWidth' | 'dLayout' | 'dInlineSpan'>>;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DForm' });
export const DForm: {
  (props: DFormProps): JSX.Element | null;
  Group: typeof DFormGroup;
  Item: typeof DFormItem;
} = (props) => {
  const {
    children,
    dForm,
    dLabelWidth,
    dLabelColon,
    dRequiredType = 'required',
    dLayout = 'horizontal',
    dInlineSpan = 6,
    dFeedbackIcon = false,
    dSize,
    dResponsiveProps,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const mediaMatch = useMediaMatch();

  const contextValue = useMemo<DFormContextData>(() => {
    const contextValue = {
      gInstance: dForm,
      gBreakpointMatchs: mediaMatch,
      gLabelWidth: dLabelWidth ?? 150,
      gLabelColon: dLabelColon ?? true,
      gRequiredType: dRequiredType,
      gLayout: dLayout,
      gInlineSpan: dInlineSpan,
      gFeedbackIcon: dFeedbackIcon,
      gSize: dSize,
    };
    if (dResponsiveProps) {
      const mergeProps = (point: string, targetKey: string, sourceKey: string) => {
        const value = dResponsiveProps[point][sourceKey];
        if (!isUndefined(value)) {
          contextValue[targetKey] = value;
        }
      };
      for (const breakpoint of mediaMatch) {
        if (breakpoint in dResponsiveProps) {
          mergeProps(breakpoint, 'gLabelWidth', 'dLabelWidth');
          mergeProps(breakpoint, 'gLayout', 'dLayout');
          mergeProps(breakpoint, 'gInlineSpan', 'dInlineSpan');
          break;
        }
      }
    }
    contextValue.gLabelWidth = dLabelWidth ?? (contextValue.gLayout === 'vertical' ? '100%' : 150);
    contextValue.gLabelColon = dLabelColon ?? (contextValue.gLayout === 'vertical' ? false : true);

    return contextValue;
  }, [dForm, mediaMatch, dLabelWidth, dLabelColon, dRequiredType, dLayout, dInlineSpan, dFeedbackIcon, dSize, dResponsiveProps]);

  return (
    <DFormContext.Provider value={contextValue}>
      <DFormGroupContext.Provider value={dForm.form}>
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
      </DFormGroupContext.Provider>
    </DFormContext.Provider>
  );
};

DForm.Group = DFormGroup;
DForm.Item = DFormItem;
