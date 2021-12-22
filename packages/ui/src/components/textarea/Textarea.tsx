import type { Updater } from '../../hooks/two-way-binding';
import type { DFormControl } from '../form';

import { isFunction, isNumber, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useRefCallback } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';

export type DTextareaRef = HTMLTextAreaElement;

export interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement>, DFormControl {
  dModel?: [string, Updater<string>?];
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onModelChange?: (value: string) => void;
}

const Textarea: React.ForwardRefRenderFunction<DTextareaRef, DTextareaProps> = (props, ref) => {
  const {
    dFormControlName,
    dModel,
    dRows,
    dResizable = true,
    dShowCount = false,
    onModelChange,
    className,
    style,
    maxLength,
    disabled,
    onClick,
    onFocus,
    onBlur,
    onChange,
    ...restProps
  } = useComponentConfig(DTextarea.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [textareaEl, textareaRef] = useRefCallback<HTMLTextAreaElement>();
  //#endregion

  const [value, changeValue] = useTwoWayBinding('', dModel, onModelChange, {
    name: dFormControlName,
  });

  const [rowNum, setRowNum] = useState(1);

  const resizable = dResizable && isUndefined(dRows);
  const heightStyle = useMemo(() => {
    let overflow: 'hidden' | undefined;
    let height: number | undefined;
    let minHeight: number | undefined;
    let maxHeight: number | undefined;

    if (!isUndefined(dRows)) {
      overflow = 'hidden';
      height = rowNum * 24 + 8;
      if (dRows !== 'auto') {
        if (isNumber(dRows.minRows)) {
          minHeight = dRows.minRows * 24 + 8;
        }
        if (isNumber(dRows.maxRows)) {
          maxHeight = dRows.maxRows * 24 + 8;
          if (maxHeight < height) {
            overflow = undefined;
          }
        }
      }
    }
    return { overflow, height, minHeight, maxHeight };
  }, [dRows, rowNum]);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      onChange?.(e);
      changeValue(e.currentTarget.value);

      const el = e.currentTarget;
      const overflow = el.style.overflow;
      const height = el.style.height;
      const minHeight = el.style.minHeight;
      el.style.overflow = 'hidden';
      el.style.height = '32px';
      el.style.minHeight = '';
      setRowNum(Math.round((el.scrollHeight - 6) / 24));
      el.style.overflow = overflow;
      el.style.height = height;
      el.style.minHeight = minHeight;
    },
    [changeValue, onChange, setRowNum]
  );

  //#region DidUpdate
  useEffect(() => {
    if (textareaEl) {
      setRowNum(Math.round((textareaEl.scrollHeight - 6) / 24));
    }
  }, [setRowNum, textareaEl]);
  //#endregion

  useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(ref, () => textareaEl, [textareaEl]);

  return (
    <>
      <textarea
        {...restProps}
        ref={textareaRef}
        className={getClassName(className, `${dPrefix}textarea`)}
        style={mergeStyle(style, {
          resize: resizable ? undefined : 'none',
          ...heightStyle,
        })}
        maxLength={maxLength}
        value={value}
        disabled={disabled}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      {dShowCount !== false && (
        <div className={`${dPrefix}textarea__count`}>
          {isFunction(dShowCount) ? dShowCount(value.length) : isUndefined(maxLength) ? value.length : `${value.length} / ${maxLength}`}
        </div>
      )}
    </>
  );
};

export const DTextarea = React.forwardRef(Textarea);
