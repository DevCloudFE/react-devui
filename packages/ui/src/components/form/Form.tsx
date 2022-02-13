import type { DGeneralStateContextData } from '../../hooks/general-state';
import type { DBreakpoints } from '../grid';
import type { DFormInstance } from './hooks';

import { isUndefined } from 'lodash';
import React, { useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, DGeneralStateContext } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { useMediaMatch } from '../grid';

export interface DFormContextData {
  gInstance: DFormInstance;
  gBreakpointMatchs: DBreakpoints[];
  gLabelWidth: number | string;
  gLabelColon: boolean;
  gRequiredType: NonNullable<DFormProps['dRequiredType']>;
  gLayout: NonNullable<DFormProps['dLayout']>;
  gInlineSpan: number | true;
  gFeedbackIcon: NonNullable<DFormProps['dFeedbackIcon']>;
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
  dSize?: 'smaller' | 'larger';
  dResponsiveProps?: Record<DBreakpoints, Pick<DFormProps, 'dLabelWidth' | 'dRequiredType' | 'dLayout' | 'dInlineSpan'>>;
}

const { COMPONENT_NAME } = generateComponentMate('DForm');
export function DForm(props: DFormProps) {
  const {
    dForm,
    dLabelWidth,
    dLabelColon,
    dRequiredType = 'required',
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

  const generalStateContextValue = useMemo<DGeneralStateContextData>(
    () => ({
      gSize: dSize,
      gDisabled: false,
    }),
    [dSize]
  );

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
          mergeProps(breakpoint, 'gRequiredType', 'dRequiredType');
          mergeProps(breakpoint, 'gLayout', 'dLayout');
          mergeProps(breakpoint, 'gInlineSpan', 'dInlineSpan');
          break;
        }
      }
    }
    contextValue.gLabelWidth = dLabelWidth ?? (contextValue.gLayout === 'vertical' ? '100%' : 150);
    contextValue.gLabelColon = dLabelColon ?? (contextValue.gLayout === 'vertical' ? false : true);

    return contextValue;
  }, [dRequiredType, dFeedbackIcon, dForm, dInlineSpan, dLabelColon, dLabelWidth, dLayout, dResponsiveProps, mediaMatch]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    onSubmit?.(e);

    e.preventDefault();
    e.stopPropagation();
  };

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
