import type { Updater } from '../../hooks/immer';
import type { DFormControl } from '../form';

import { isFunction, isNumber, isUndefined } from 'lodash';
import React, { useEffect, useImperativeHandle, useMemo } from 'react';
import { useCallback } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useImmer, useRefCallback } from '../../hooks';
import { getClassName, mergeStyle } from '../../utils';

export type DTextareaRef = HTMLTextAreaElement;

export interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement>, DFormControl {
  dValue?: [string, Updater<string>?];
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onValueChange?: (value: string) => void;
}

export const DTextarea = React.forwardRef<DTextareaRef, DTextareaProps>((props, ref) => {
  const {
    dFormControlName,
    dValue,
    dRows,
    dResizable = true,
    dShowCount = false,
    onValueChange,
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

  const [bindValue, changeBindValue] = useTwoWayBinding('', dValue, onValueChange, {
    name: dFormControlName,
  });

  const [rowNum, setRowNum] = useImmer(1);

  const resizable = dResizable && isUndefined(dRows);
  const heightStyle = useMemo(() => {
    let overflow: 'hidden' | undefined;
    let height: number | undefined;
    let minHeight: number | undefined;
    let maxHeight: number | undefined;

    if (!isUndefined(dRows)) {
      height = rowNum * 24 + 8;
      if (dRows === 'auto') {
        overflow = 'hidden';
      } else {
        if (isNumber(dRows.minRows)) {
          minHeight = dRows.minRows * 24 + 8;
        }
        if (isNumber(dRows.maxRows)) {
          maxHeight = dRows.maxRows * 24 + 8;
          if (maxHeight > height) {
            overflow = 'hidden';
          }
        }
      }
    }
    return { overflow, height, minHeight, maxHeight };
  }, [dRows, rowNum]);

  const handleChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
    (e) => {
      onChange?.(e);
      changeBindValue(e.currentTarget.value);

      const el = e.currentTarget;
      const overflow = el.style.overflow;
      const height = el.style.height;
      el.style.overflow = 'hidden';
      el.style.height = '32px';
      setRowNum((el.scrollHeight - 6) / 24);
      el.style.overflow = overflow;
      el.style.height = height;
    },
    [changeBindValue, onChange, setRowNum]
  );

  //#region DidUpdate
  useEffect(() => {
    if (textareaEl) {
      setRowNum((textareaEl.scrollHeight - 6) / 24);
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
        value={bindValue}
        disabled={disabled}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      <div className={`${dPrefix}textarea__count`} style={{ display: dShowCount === false ? 'none' : undefined }}>
        {isFunction(dShowCount)
          ? dShowCount(bindValue.length)
          : isUndefined(maxLength)
          ? bindValue.length
          : `${bindValue.length} / ${maxLength}`}
      </div>
    </>
  );
});
