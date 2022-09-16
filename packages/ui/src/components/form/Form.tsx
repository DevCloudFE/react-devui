import type { DSize } from '../../utils/types';
import type { DBreakpoints } from '../grid';

import { isUndefined } from 'lodash';
import React from 'react';

import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useMediaQuery } from '../../hooks';
import { registerComponentMate } from '../../utils';
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
  gBreakpointsMatched: DBreakpoints[];
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
  dResponsiveProps?: Partial<Record<DBreakpoints, Pick<DFormProps, 'dLabelWidth' | 'dLayout' | 'dInlineSpan'>>>;
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
    dResponsiveProps,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const breakpointsMatched = useMediaQuery();

  const contextValue = (() => {
    const contextValue: DFormContextData = {
      gLabelWidth: dLabelWidth ?? 150,
      gLabelColon: dLabelColon ?? true,
      gRequiredType: dRequiredType,
      gLayout: dLayout,
      gInlineSpan: dInlineSpan,
      gFeedbackIcon: dFeedbackIcon,
      gSize: dSize,
      gBreakpointsMatched: breakpointsMatched,
    };
    if (dResponsiveProps) {
      const mergeProps = (point: string, targetKey: string, sourceKey: string) => {
        const value = dResponsiveProps[point][sourceKey];
        if (!isUndefined(value)) {
          contextValue[targetKey] = value;
        }
      };
      for (const breakpoint of breakpointsMatched) {
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
  })();

  return (
    <DFormContext.Provider value={contextValue}>
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
