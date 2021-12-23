import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { DBreakpoints } from '../grid';
import type { DFormInstance } from './hooks';

import { isUndefined } from 'lodash';
import React, { useCallback, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, DGeneralStateContext } from '../../hooks';
import { getClassName } from '../../utils';
import { MEDIA_QUERY_LIST } from '../grid';
import { DRow } from '../grid';

export interface DFormContextData {
  formInstance: DFormInstance;
  formBreakpointMatchs: DBreakpoints[];
  formLabelWidth: string | number;
  formLabelColon: boolean;
  formCustomLabel: NonNullable<DFormProps['dCustomLabel']>;
  formLayout: NonNullable<DFormProps['dLayout']>;
  formInlineSpan: number | true;
  formFeedbackIcon: NonNullable<DFormProps['dFeedbackIcon']>;
}
export const DFormContext = React.createContext<DFormContextData | null>(null);

export interface DFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  dForm: DFormInstance;
  dLabelWidth?: string | number;
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
  } = useComponentConfig(DForm.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      onSubmit?.(e);
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

  return (
    <DGeneralStateContext.Provider value={generalStateContextValue}>
      <DRow
        dAsListener
        dRender={(match, matchs) => {
          const contextValue = {
            formInstance: dForm,
            formBreakpointMatchs: matchs,
            formLabelWidth: dLabelWidth ?? 150,
            formLabelColon: dLabelColon ?? true,
            formCustomLabel: dCustomLabel,
            formLayout: dLayout,
            formInlineSpan: dInlineSpan,
            formFeedbackIcon: dFeedbackIcon,
          };
          if (dResponsiveProps) {
            const keys = Object.keys(dResponsiveProps);
            const mergeProps = (point: string, targetKey: string, sourceKey: string) => {
              const value = dResponsiveProps[point][sourceKey];
              if (!isUndefined(value)) {
                contextValue[targetKey] = value;
              }
            };
            for (const point of [...MEDIA_QUERY_LIST].reverse()) {
              if (keys.includes(point) && matchs.includes(point)) {
                mergeProps(point, 'formLabelWidth', 'dLabelWidth');
                mergeProps(point, 'formCustomLabel', 'dCustomLabel');
                mergeProps(point, 'formLayout', 'dLayout');
                mergeProps(point, 'formInlineSpan', 'dInlineSpan');
                break;
              }
            }
          }
          contextValue.formLabelWidth = dLabelWidth ?? (contextValue.formLayout === 'vertical' ? '100%' : 150);
          contextValue.formLabelColon = dLabelColon ?? (contextValue.formLayout === 'vertical' ? false : true);

          return (
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
          );
        }}
      ></DRow>
    </DGeneralStateContext.Provider>
  );
}
