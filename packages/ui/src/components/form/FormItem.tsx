import type { DBreakpoints } from '../grid';
import type { DFormContextData } from './Form';
import type { AbstractControl, FormControlStatus } from './form';

import { isArray, isBoolean, isNull, isNumber, isString, isUndefined } from 'lodash';
import React, { useCallback, useContext, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useCustomContext, useImmer, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { MEDIA_QUERY_LIST } from '../grid';
import { DIcon } from '../icon';
import { DTooltip } from '../tooltip';
import { DError } from './Error';
import { DFormContext } from './Form';
import { DFormGroupContext } from './FormGroup';
import { Validators } from './form';

type DErrors = Array<{ identity: string; key: string; message: string; status: 'warning' | 'error'; hidden?: true }>;

export type DValidateStatus = 'success' | 'warning' | 'error' | 'pending';

export type DErrorInfo =
  | string
  | { message: string; status: 'warning' | 'error' }
  | { [index: string]: string | { message: string; status: 'warning' | 'error' } };

export interface DFormItemContextData {
  updateFormItems: (identity: string, formControlName: string | undefined, id: string | undefined) => void;
  removeFormItems: (identity: string) => void;
}
export const DFormItemContext = React.createContext<DFormItemContextData | null>(null);

export interface DFormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  dLabel?: React.ReactNode;
  dLabelWidth?: number | string;
  dLabelExtra?: Array<{ title: string; icon?: React.ReactNode } | string>;
  dShowRequired?: boolean;
  dErrors?: DErrorInfo | Array<[string, DErrorInfo]>;
  dSpan?: number | string | true;
  dResponsiveProps?: Record<DBreakpoints, Pick<DFormItemProps, 'dLabelWidth' | 'dSpan'>>;
}

export function DFormItem(props: DFormItemProps) {
  const { dLabel, dLabelWidth, dLabelExtra, dShowRequired, dErrors, dSpan, dResponsiveProps, className, children, ...restProps } =
    useComponentConfig(DFormItem.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const {
    formBreakpointMatchs,
    formLabelWidth,
    formLabelColon,
    formCustomLabel,
    formInstance,
    formLayout,
    formInlineSpan,
    formFeedbackIcon,
  } = useContext(DFormContext) as DFormContextData;
  const [{ formGroupPath }] = useCustomContext(DFormGroupContext);
  //#endregion

  const [t] = useTranslation('DForm');

  const dataRef = useRef<{ preErrors: DErrors }>({
    preErrors: [],
  });

  const { span, labelWidth } = (() => {
    const _props = {
      span: dSpan ?? (formLayout === 'inline' ? formInlineSpan : 12),
      labelWidth: dLabelWidth ?? formLabelWidth,
    };

    if (dResponsiveProps) {
      const keys = Object.keys(dResponsiveProps);
      const mergeProps = (point: string, targetKey: string, sourceKey: string) => {
        const value = dResponsiveProps[point][sourceKey];
        if (!isUndefined(value)) {
          _props[targetKey] = value;
        }
      };
      for (const point of [...MEDIA_QUERY_LIST].reverse()) {
        if (keys.includes(point) && formBreakpointMatchs.includes(point)) {
          mergeProps(point, 'span', 'dSpan');
          mergeProps(point, 'labelWidth', 'dLabelWidth');
        }
      }
    }
    return _props;
  })();

  const [formItems, setFormItems] = useImmer(new Map<string, { formControlName: string; id?: string }>());

  const getControl = useCallback(
    (formControlName: string) => {
      const control = formInstance.form.get((formGroupPath ?? []).concat([formControlName]));
      if (isNull(control)) {
        throw new Error(`Cant find '${formControlName}', please check if name exists!`);
      }
      return control;
    },
    [formGroupPath, formInstance]
  );

  const [errors, hasError, errorStyle, status] = useMemo<
    [Array<{ identity: string; errors: DErrors }>, boolean, 'error' | 'warning', DValidateStatus | undefined]
  >(() => {
    const errors: DErrors = [];
    let hasError = false;
    let status: DValidateStatus | undefined = undefined;
    const setStatus = (formControlStatus: FormControlStatus) => {
      if (formControlStatus === 'PENDING') {
        status = 'pending';
      }
      if (formControlStatus === 'INVALID' && status !== 'pending') {
        status = 'error';
      }
      if (formControlStatus === 'VALID' && status === undefined) {
        status = 'success';
      }
    };

    if (dErrors) {
      const getErrors = (identity: string, formControl: AbstractControl, errorInfo: DErrorInfo) => {
        if (isString(errorInfo)) {
          errors.push({ identity, key: identity, message: errorInfo, status: 'error' });
        } else if (Object.keys(errorInfo).length === 2 && 'message' in errorInfo && 'status' in errorInfo) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errors.push({ identity, key: identity, ...errorInfo } as any);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const key of Object.keys(formControl.errors!)) {
            if (key in errorInfo) {
              if (isString(errorInfo[key])) {
                errors.push({ identity, key: `${identity}-${key}`, message: errorInfo[key], status: 'error' });
              } else {
                errors.push({ identity, key: `${identity}-${key}`, ...errorInfo[key] });
              }
            }
          }
        }
      };

      for (const [identity, { formControlName }] of formItems.entries()) {
        const formControl = getControl(formControlName);
        if (formControl.dirty) {
          setStatus(formControl.status);

          if (formControl.invalid && formControl.errors) {
            hasError = true;
            if (isArray(dErrors)) {
              const errorInfo = dErrors.find((item) => item[0] === formControlName);
              if (errorInfo) {
                getErrors(identity, formControl, errorInfo[1]);
              }
            } else {
              getErrors(identity, formControl, dErrors);
            }
          }
        }
      }
    }

    const errorStyle = errors.findIndex((item) => item.status === 'error') !== -1 ? 'error' : 'warning';
    if (errorStyle === 'warning' && status === 'error') {
      status = 'warning';
    }

    const preErrors = dataRef.current.preErrors;
    dataRef.current.preErrors = errors;
    preErrors.forEach((error, inedx) => {
      if (errors.findIndex((item) => item.key === error.key) === -1) {
        errors.splice(inedx, 0, { ...error, hidden: true });
      }
    });

    const identitys = new Set(errors.map((item) => item.identity));
    const _errors: Array<{ identity: string; errors: DErrors }> = [];
    identitys.forEach((identity) => {
      _errors.push({ identity, errors: errors.filter((item) => item.identity === identity) });
    });

    return [_errors, hasError, errorStyle, status];
  }, [dErrors, formItems, getControl]);

  const errorsNode = useMemo(
    () =>
      errors.map((errors) => (
        <div key={errors.identity} id={errors.identity}>
          {errors.errors.map((error) => (
            <DError
              key={error.key}
              dVisible={!error.hidden}
              dMessage={error.message}
              dStatus={error.status}
              onHidden={() => {
                dataRef.current.preErrors = dataRef.current.preErrors.filter((item) => item.key !== error.key);
              }}
            ></DError>
          ))}
        </div>
      )),
    [errors]
  );

  const feedbackIcon = useMemo(() => {
    if (isUndefined(status)) {
      return null;
    } else {
      const statusIcons = {
        pending: (
          <DIcon viewBox="0 0 1024 1024" dSpin>
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </DIcon>
        ),
        error: (
          <DIcon viewBox="64 64 896 896">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"></path>
          </DIcon>
        ),
        warning: (
          <DIcon viewBox="64 64 896 896">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z"></path>
          </DIcon>
        ),
        success: (
          <DIcon viewBox="64 64 896 896">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"></path>
          </DIcon>
        ),
      };
      if (isBoolean(formFeedbackIcon)) {
        return statusIcons[status];
      } else {
        return formFeedbackIcon[status] ?? statusIcons[status];
      }
    }
  }, [formFeedbackIcon, status]);

  const required = useMemo(() => {
    if (isBoolean(dShowRequired)) {
      return dShowRequired;
    }
    for (const { formControlName } of formItems.values()) {
      if (getControl(formControlName).hasValidator(Validators.required)) {
        return true;
      }
    }
    return false;
  }, [dShowRequired, formItems, getControl]);

  const id = useMemo(() => {
    if (formItems.size === 1) {
      for (const { id } of formItems.values()) {
        return id;
      }
    }
  }, [formItems]);

  const extraNode = useMemo(() => {
    if (dLabelExtra) {
      return dLabelExtra.map((extra, index) => {
        if (isString(extra)) {
          return <span key={index}>{extra}</span>;
        } else {
          return (
            <DTooltip key={index} dTitle={extra.title}>
              {extra.icon ?? (
                <DIcon viewBox="64 64 896 896" role="button" tabIndex={-1} dSize="1.1em">
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                  <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
                </DIcon>
              )}
            </DTooltip>
          );
        }
      });
    }
  }, [dLabelExtra]);

  const handleLabelClick = useCallback<React.MouseEventHandler<HTMLLabelElement>>((e) => {
    const id = e.currentTarget.getAttribute('for');
    if (id) {
      const el = document.getElementById(id);
      if (el && el.tagName !== 'INPUT') {
        e.preventDefault();
        el.focus({ preventScroll: true });
        el.click();
      }
    }
  }, []);

  const stateBackflow = useMemo<Pick<DFormItemContextData, 'updateFormItems' | 'removeFormItems'>>(
    () => ({
      updateFormItems: (identity, formControlName, id) => {
        if (isString(formControlName)) {
          setFormItems((draft) => {
            draft.set(identity, { formControlName, id });
          });
        }
      },
      removeFormItems: (identity) => {
        setFormItems((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setFormItems]
  );
  const contextValue = useMemo<DFormItemContextData>(
    () => ({
      ...stateBackflow,
    }),
    [stateBackflow]
  );

  return (
    <DFormItemContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(
          className,
          `${dPrefix}form-item`,
          hasError
            ? {
                'is-error': errorStyle === 'error',
                'is-warning': errorStyle === 'warning',
              }
            : {},
          {
            'is-pending': status === 'pending',
            [`${dPrefix}form-item--vertical`]: formLayout === 'vertical',
          }
        )}
        style={{
          flexGrow: span === true ? 1 : undefined,
          width: span === true ? undefined : isNumber(span) ? `calc((100% / 12) * ${span})` : span,
        }}
      >
        <div className={`${dPrefix}form-item__container`}>
          {labelWidth !== 0 &&
            (dLabel ? (
              <div
                className={getClassName(`${dPrefix}form-item__label`, {
                  [`${dPrefix}form-item__label--required`]: formCustomLabel === 'required' && dLabel && required,
                  [`${dPrefix}form-item__label--colon`]: dLabel && formLabelColon,
                })}
                style={{ width: formLayout === 'vertical' ? undefined : labelWidth }}
              >
                <label htmlFor={id} onClick={handleLabelClick}>
                  {dLabel}
                  {(extraNode || formCustomLabel === 'optional') && (
                    <div className={`${dPrefix}form-item__extra`}>
                      {extraNode}
                      {formCustomLabel === 'optional' && <span>{t('Optional')}</span>}
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div style={{ width: labelWidth }}></div>
            ))}
          <div
            className={`${dPrefix}form-item__content`}
            style={{ width: formLayout === 'vertical' ? '100%' : `calc(100% - ${isNumber(labelWidth) ? labelWidth + 'px' : labelWidth})` }}
          >
            {status === 'pending' && (
              <>
                <span className={`${dPrefix}form-item__pending`}></span>
                <span className={`${dPrefix}form-item__pending`}></span>
                <span className={`${dPrefix}form-item__pending`}></span>
                <span className={`${dPrefix}form-item__pending`}></span>
              </>
            )}
            {children}
          </div>
          {formFeedbackIcon && (
            <div
              className={getClassName(`${dPrefix}form-item__feedback-icon`, {
                [`is-${status}`]: status,
              })}
            >
              {feedbackIcon}
            </div>
          )}
        </div>
        <div className={`${dPrefix}form-item__errors`} style={{ left: formLayout === 'vertical' ? undefined : labelWidth }}>
          {errorsNode}
        </div>
        <div className={`${dPrefix}form-item__errors-height`} aria-hidden={true}>
          {errorsNode}
        </div>
      </div>
    </DFormItemContext.Provider>
  );
}
