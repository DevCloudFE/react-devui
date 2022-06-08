import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DFormControl } from '../form';

import { isFunction, isNumber, isUndefined } from 'lodash';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralContext, useForkRef } from '../../hooks';
import { registerComponentMate, getClassName } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DBaseSupport } from '../_base-support';

export type DTextareaRef = HTMLTextAreaElement;

export interface DTextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  dFormControl?: DFormControl;
  dModel?: [string, DUpdater<string>?];
  dRows?: 'auto' | { minRows?: number; maxRows?: number };
  dResizable?: boolean;
  dShowCount?: boolean | ((num: number) => React.ReactNode);
  onModelChange?: (value: string) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTextarea' });
function Textarea(props: DTextareaProps, ref: React.ForwardedRef<DTextareaRef>) {
  const {
    dFormControl,
    dModel,
    dRows,
    dResizable = true,
    dShowCount = false,
    onModelChange,

    className,
    style,
    maxLength,
    disabled: _disabled,
    onChange,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize } = useGeneralContext();
  //#endregion

  //#region Ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //#endregion

  const combineTextareaRef = useForkRef(textareaRef, ref);

  const lineHeight = gSize === 'larger' ? 28 : gSize === 'smaller' ? 20 : 24;

  const [value, changeValue] = useTwoWayBinding<string>('', dModel, onModelChange, {
    formControl: dFormControl?.control,
  });

  const disabled = _disabled || dFormControl?.control.disabled;

  const resizable = dResizable && isUndefined(dRows);

  const getRowNum = () => {
    if (textareaRef.current) {
      const cssText = textareaRef.current.style.cssText;
      textareaRef.current.style.cssText += 'overflow:hidden;height:32px;min-height:unset;';
      setRowNum(Math.round((textareaRef.current.scrollHeight - 6) / lineHeight));
      textareaRef.current.style.cssText = cssText;
    }
  };

  const [rowNum, setRowNum] = useState(1);
  useLayoutEffect(() => {
    getRowNum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <>
      <DBaseSupport dFormControl={dFormControl}>
        <DBaseInput
          {...restProps}
          ref={combineTextareaRef}
          className={getClassName(className, `${dPrefix}textarea`, {
            [`${dPrefix}textarea--${gSize}`]: gSize,
          })}
          style={{
            ...style,
            ...heightStyle,
            resize: resizable ? undefined : 'none',
          }}
          maxLength={maxLength}
          value={value}
          disabled={disabled}
          dTag="textarea"
          dFormControl={dFormControl}
          onChange={(e) => {
            onChange?.(e);

            changeValue(e.currentTarget.value);
            getRowNum();
          }}
        />
      </DBaseSupport>
      {dShowCount !== false && (
        <div className={`${dPrefix}textarea__count`}>
          {isFunction(dShowCount) ? dShowCount(value.length) : isUndefined(maxLength) ? value.length : `${value.length} / ${maxLength}`}
        </div>
      )}
    </>
  );
}

export const DTextarea = React.forwardRef(Textarea);
