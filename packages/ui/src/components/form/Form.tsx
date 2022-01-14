import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { DBreakpoints } from '../grid';
import type { DFormInstance } from './hooks';

import { isUndefined } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { useMediaMatch } from '../grid';

export interface DFormContextData {
  formInstance: DFormInstance;
  formBreakpointMatchs: DBreakpoints[];
  formLabelWidth: number | string;
  formLabelColon: boolean;
  formCustomLabel: NonNullable<DFormProps['dCustomLabel']>;
  formLayout: NonNullable<DFormProps['dLayout']>;
  formInlineSpan: number | true;
  formFeedbackIcon: NonNullable<DFormProps['dFeedbackIcon']>;
}
export const DFormContext = React.createContext<DFormContextData | null>(null);

export interface DFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  dForm: DFormInstance;
  dLabelWidth?: number | string;
  dLabelColon?: boolean;
  dCustomLabel?: 'required' | 'optional' | 'hidden';
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
  dSize?: 'smaller' | 'larger';
  dResponsiveProps?: Record<DBreakpoints, Pick<DFormProps, 'dLabelWidth' | 'dCustomLabel' | 'dLayout' | 'dInlineSpan'>>;
}

const { COMPONENT_NAME } = generateComponentMate('DForm');
export function DForm(props: DFormProps) {
  const {
    dForm,
    dLabelWidth,
    dLabelColon,
    dCustomLabel = 'required',
    dLayout = 'horizontal',
    dInlineSpan = 6,
    dFeedbackIcon = false,
    dSize,
    dResponsiveProps,
    className,
    autoComplete = 'off',
    children,
    onSubmit,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      onSubmit?.(e);

      e.preventDefault();
      e.stopPropagation();
    },
    [onSubmit]
  );

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gSize: dSize,
      gDisabled: false,
    }),
    [dSize]
  );

  const mediaMatch = useMediaMatch();

  const contextValue = useMemo(() => {
    const contextValue = {
      formInstance: dForm,
      formBreakpointMatchs: mediaMatch,
      formLabelWidth: dLabelWidth ?? 150,
      formLabelColon: dLabelColon ?? true,
      formCustomLabel: dCustomLabel,
      formLayout: dLayout,
      formInlineSpan: dInlineSpan,
      formFeedbackIcon: dFeedbackIcon,
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
          mergeProps(breakpoint, 'formLabelWidth', 'dLabelWidth');
          mergeProps(breakpoint, 'formCustomLabel', 'dCustomLabel');
          mergeProps(breakpoint, 'formLayout', 'dLayout');
          mergeProps(breakpoint, 'formInlineSpan', 'dInlineSpan');
          break;
        }
      }
    }
    contextValue.formLabelWidth = dLabelWidth ?? (contextValue.formLayout === 'vertical' ? '100%' : 150);
    contextValue.formLabelColon = dLabelColon ?? (contextValue.formLayout === 'vertical' ? false : true);

    return contextValue;
  }, [dCustomLabel, dFeedbackIcon, dForm, dInlineSpan, dLabelColon, dLabelWidth, dLayout, dResponsiveProps, mediaMatch]);

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <DFormContext.Provider value={contextValue}>
        <form
          {...restProps}
          className={getClassName(className, `${dPrefix}form`, {
            [`${dPrefix}form--${dSize}`]: dSize,
          })}
          autoComplete={autoComplete}
          onSubmit={handleSubmit}
        >
          {children}
        </form>
      </DFormContext.Provider>
    </DGeneralStateContext.Provider>
  );
}
