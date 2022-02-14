import type { DUpdater } from '../../hooks/two-way-binding';

import { isFunction, isNumber, isUndefined } from 'lodash';
import React, { useEffect, useId, useImperativeHandle, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useRefCallback, useGeneralState } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';

export type DTextareaRef = HTMLTextAreaElement;

export interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  dFormControlName?: string;
  dModel?: [string, DUpdater<string>?];
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onModelChange?: (value: string) => void;
}

const { COMPONENT_NAME } = generateComponentMate('DTextarea');
const Textarea: React.ForwardRefRenderFunction<DTextareaRef, DTextareaProps> = (props, ref) => {
  const {
    dFormControlName,
    dModel,
    dRows,
    dResizable = true,
    dShowCount = false,
    onModelChange,
    id,
    className,
    style,
    maxLength,
    disabled,
    onChange,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize } = useGeneralState();
  //#endregion

  //#region Ref
  const [textareaEl, textareaRef] = useRefCallback<HTMLTextAreaElement>();
  //#endregion

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}input-${uniqueId}`;

  const lineHeight = gSize === 'larger' ? 28 : gSize === 'smaller' ? 20 : 24;

  const [value, changeValue, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding<string>('', dModel, onModelChange, {
    formControlName: dFormControlName,
    id: _id,
  });

  const _disabled = disabled || controlDisabled;

  const [rowNum, setRowNum] = useState(1);

  const resizable = dResizable && isUndefined(dRows);
  const heightStyle = (() => {
    let overflow: 'hidden' | undefined;
    let height: number | undefined;
    let minHeight: number | undefined;
    let maxHeight: number | undefined;

    if (!isUndefined(dRows)) {
      overflow = 'hidden';
      height = rowNum * lineHeight + 8;
      if (dRows !== 'auto') {
        if (isNumber(dRows.minRows)) {
          minHeight = dRows.minRows * lineHeight + 8;
        }
        if (isNumber(dRows.maxRows)) {
          maxHeight = dRows.maxRows * lineHeight + 8;
          if (maxHeight < height) {
            overflow = undefined;
          }
        }
      }
    }
    return { overflow, height, minHeight, maxHeight };
  })();

  useEffect(() => {
    if (textareaEl) {
      setRowNum(Math.round((textareaEl.scrollHeight - 6) / lineHeight));
    }
  }, [lineHeight, setRowNum, textareaEl]);

  useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(ref, () => textareaEl, [textareaEl]);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChange?.(e);

    changeValue(e.currentTarget.value);

    const el = e.currentTarget;
    const overflow = el.style.overflow;
    const height = el.style.height;
    const minHeight = el.style.minHeight;
    el.style.overflow = 'hidden';
    el.style.height = '32px';
    el.style.minHeight = '';
    setRowNum(Math.round((el.scrollHeight - 6) / lineHeight));
    el.style.overflow = overflow;
    el.style.height = height;
    el.style.minHeight = minHeight;
  };

  return (
    <>
      <textarea
        {...restProps}
        {...ariaAttribute}
        ref={textareaRef}
        id={_id}
        className={getClassName(className, `${dPrefix}textarea`, validateClassName, {
          [`${dPrefix}textarea--${gSize}`]: gSize,
        })}
        style={mergeStyle(
          {
            resize: resizable ? undefined : 'none',
            ...heightStyle,
          },
          style
        )}
        maxLength={maxLength}
        value={value}
        disabled={_disabled}
        aria-disabled={_disabled}
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
