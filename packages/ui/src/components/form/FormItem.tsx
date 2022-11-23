import type { AbstractControl } from './abstract-control';

import { isBoolean, isFunction, isNull, isNumber, isString, isUndefined } from 'lodash';
import React, { useContext, useEffect, useRef } from 'react';

import { useId } from '@react-devui/hooks';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, LoadingOutlined, QuestionCircleOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { useContextRequired } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DTooltip } from '../tooltip';
import { DError } from './Error';
import { DFormContext } from './Form';
import { DFormGroupContext } from './FormGroup';
import { Validators } from './validators';

type DErrors = { key: string; formControlName: string; message: string; status: 'warning' | 'error'; hidden?: true }[];

export interface DFormControl {
  control: AbstractControl;
  wrapperAttrs: { [index: string]: boolean };
  inputAttrs: {
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  };
}

type DValidateStatus = 'success' | 'warning' | 'error' | 'pending';

export type DErrorInfo =
  | string
  | { message: string; status: 'warning' | 'error' }
  | { [index: string]: string | { message: string; status: 'warning' | 'error' } };

export interface DFormItemProps<T extends { [index: string]: DErrorInfo }> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode | ((formControls: { [N in keyof T]: DFormControl }) => React.ReactNode);
  dFormControls?: T;
  dLabel?: React.ReactNode;
  dLabelWidth?: number | string;
  dLabelExtra?: ({ title: string; icon?: React.ReactElement } | string)[];
  dShowRequired?: boolean;
  dColNum?: number;
  dSpan?: number | string | true;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DForm.Item' as const });
export function DFormItem<T extends { [index: string]: DErrorInfo }>(props: DFormItemProps<T>): JSX.Element | null {
  const {
    children,
    dFormControls,
    dLabel,
    dLabelWidth,
    dLabelExtra,
    dShowRequired,
    dColNum = 12,
    dSpan,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gLabelWidth, gLabelColon, gRequiredType, gLayout, gInlineSpan, gFeedbackIcon } = useContextRequired(DFormContext);
  const formGroup = useContext(DFormGroupContext)!;
  //#endregion

  //#region Ref
  const labelRef = useRef<HTMLLabelElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    prevErrors: DErrors;
  }>({
    prevErrors: [],
  });

  const [t] = useTranslation();

  const uniqueId = useId();
  const getErrorId = (formControlName: string) => `${formControlName}-error-${uniqueId}`;

  const formControls = (() => {
    const obj = {} as { [N in keyof T]: DFormControl };
    Object.keys(dFormControls ?? {}).forEach((formControlName: keyof T) => {
      const formControl = formGroup.get(formControlName as string);
      if (isNull(formControl)) {
        throw new Error(`Cant find '${formControlName as string}', please check if name exists!`);
      }
      obj[formControlName] = {
        control: formControl,
        wrapperAttrs: {},
        inputAttrs: {
          'aria-invalid': formControl.enabled && formControl.dirty && formControl.invalid,
        },
      };
    });
    return obj;
  })();

  const span = dSpan ?? (gLayout === 'inline' ? gInlineSpan : dColNum);
  const labelWidth = dLabelWidth ?? gLabelWidth;

  const [errorNodes, formItemStatus] = (() => {
    const errors: DErrors = [];
    let formItemStatus: DValidateStatus | undefined;

    Object.entries(dFormControls ?? {}).forEach(([formControlName, errorInfo]) => {
      const { control } = formControls[formControlName];
      if (control.enabled && control.dirty) {
        let status: DValidateStatus = 'success';
        if (control.status === 'PENDING') {
          status = formItemStatus = 'pending';
        } else if (control.status === 'INVALID') {
          status = 'warning';
          if (formItemStatus !== 'pending' && formItemStatus !== 'error') {
            formItemStatus = 'warning';
          }
        } else if (control.status === 'VALID') {
          status = 'success';
          if (formItemStatus === undefined) {
            formItemStatus = 'success';
          }
        }
        let hasError = false;
        if (control.invalid && control.errors) {
          if (isString(errorInfo)) {
            errors.push({ key: formControlName, formControlName, message: errorInfo, status: 'error' });
            hasError = true;
          } else if (Object.keys(errorInfo).length === 2 && 'message' in errorInfo && 'status' in errorInfo) {
            errors.push({
              key: formControlName,
              formControlName,
              ...(errorInfo as { message: string; status: 'warning' | 'error' }),
            });
            if (errorInfo.status === 'error') {
              hasError = true;
            }
          } else if (control.errors) {
            for (const key of Object.keys(control.errors)) {
              if (key in errorInfo) {
                if (isString(errorInfo[key])) {
                  errors.push({ key: `${formControlName}-${key}`, formControlName, message: errorInfo[key], status: 'error' });
                  hasError = true;
                } else {
                  errors.push({ key: `${formControlName}-${key}`, formControlName, ...errorInfo[key] });
                  if (errorInfo[key].status === 'error') {
                    hasError = true;
                  }
                }
              }
            }
          }
        }
        if (hasError) {
          if (status === 'warning') {
            status = 'error';
          }
          if (formItemStatus === 'warning') {
            formItemStatus = 'error';
          }
        }

        if (status !== 'success') {
          formControls[formControlName].wrapperAttrs[`data-form-invalid-${status}`] = true;
        }
      }
    });

    dataRef.current.prevErrors.forEach((error, inedx) => {
      if (errors.findIndex((item) => item.key === error.key) === -1) {
        errors.splice(inedx, 0, { ...error, hidden: true });
      }
    });
    dataRef.current.prevErrors = errors;

    const errorNames = new Set(errors.map((item) => item.formControlName));
    const errorNodes: JSX.Element[] = [];
    errorNames.forEach((formControlName) => {
      const id = getErrorId(formControlName);
      formControls[formControlName].inputAttrs['aria-describedby'] = id;

      errorNodes.push(
        <div key={formControlName} id={id}>
          {errors
            .filter((item) => item.formControlName === formControlName)
            .map((error) => (
              <DError
                key={error.key}
                dVisible={!error.hidden}
                dMessage={error.message}
                dStatus={error.status}
                onHidden={() => {
                  dataRef.current.prevErrors = dataRef.current.prevErrors.filter((item) => item.key !== error.key);
                }}
              ></DError>
            ))}
        </div>
      );
    });

    return [errorNodes, formItemStatus];
  })();

  const required = (() => {
    if (isBoolean(dShowRequired)) {
      return dShowRequired;
    }
    for (const { control } of Object.values(formControls)) {
      if (control.hasValidator(Validators.required)) {
        return true;
      }
    }
    return false;
  })();

  const feedbackIcon = (() => {
    if (isUndefined(formItemStatus)) {
      return null;
    } else {
      const statusIcons = {
        pending: <LoadingOutlined dSpin />,
        error: <CloseCircleFilled />,
        warning: <ExclamationCircleFilled />,
        success: <CheckCircleFilled />,
      };
      if (isBoolean(gFeedbackIcon)) {
        return statusIcons[formItemStatus];
      } else {
        return gFeedbackIcon[formItemStatus] ?? statusIcons[formItemStatus];
      }
    }
  })();

  const extraNode = (() => {
    if (dLabelExtra) {
      return dLabelExtra.map((extra, index) =>
        isString(extra) ? (
          <div key={index}>{extra}</div>
        ) : (
          <DTooltip key={index} dTitle={extra.title}>
            {extra.icon ?? <QuestionCircleOutlined style={{ cursor: 'pointer' }} dSize="1.1em" />}
          </DTooltip>
        )
      );
    }
  })();

  const contentWidth = gLayout === 'vertical' ? '100%' : `calc(100% - ${isNumber(labelWidth) ? labelWidth + 'px' : labelWidth})`;

  useEffect(() => {
    if (labelRef.current && contentRef.current) {
      const el = contentRef.current.querySelector(`[data-form-item-label-for="true"]`);
      if (el) {
        labelRef.current.setAttribute('for', el.id);
      }
    }
  });

  return (
    <div
      {...restProps}
      className={getClassName(restProps.className, `${dPrefix}form__item`, {
        [`${dPrefix}form__item--vertical`]: gLayout === 'vertical',
      })}
      style={{
        ...restProps.style,
        flexGrow: span === true ? 1 : undefined,
        flexShrink: span === true ? undefined : 0,
        width: span === true ? undefined : isNumber(span) ? `calc((100% / ${dColNum}) * ${span})` : span,
      }}
    >
      <div className={`${dPrefix}form__item-container`}>
        {labelWidth !== 0 &&
          (dLabel ? (
            <label
              ref={labelRef}
              className={getClassName(`${dPrefix}form__item-label`, {
                [`${dPrefix}form__item-label--required`]: gRequiredType === 'required' && required,
                [`${dPrefix}form__item-label--colon`]: gLabelColon,
              })}
              style={{ width: gLayout === 'vertical' ? undefined : labelWidth }}
            >
              {dLabel}
              {(extraNode || (gRequiredType === 'optional' && !required)) && (
                <div className={`${dPrefix}form__item-label-extra`}>
                  {extraNode}
                  {gRequiredType === 'optional' && !required && <div>{t('Form', 'Optional')}</div>}
                </div>
              )}
            </label>
          ) : (
            <div style={{ width: labelWidth }}></div>
          ))}
        <div ref={contentRef} className={`${dPrefix}form__item-content`} style={{ width: contentWidth }}>
          {formItemStatus === 'pending' && (
            <>
              <div className={getClassName(`${dPrefix}form__pending`, `${dPrefix}form__pending--1`)}></div>
              <div className={getClassName(`${dPrefix}form__pending`, `${dPrefix}form__pending--2`)}></div>
              <div className={getClassName(`${dPrefix}form__pending`, `${dPrefix}form__pending--3`)}></div>
              <div className={getClassName(`${dPrefix}form__pending`, `${dPrefix}form__pending--4`)}></div>
            </>
          )}
          {isFunction(children) ? children(formControls) : children}
        </div>
        {gFeedbackIcon && (
          <div
            className={getClassName(`${dPrefix}form__feedback-icon`, {
              [`is-${formItemStatus}`]: formItemStatus,
            })}
          >
            {feedbackIcon}
          </div>
        )}
      </div>
      {!isUndefined(dFormControls) && (
        <div className={`${dPrefix}form__error-container`} style={{ width: contentWidth }}>
          {errorNodes}
        </div>
      )}
    </div>
  );
}
