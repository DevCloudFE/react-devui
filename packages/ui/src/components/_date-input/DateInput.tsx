import type { DSize } from '../../utils';
import type { DComboboxKeyboardSupportRenderProps } from '../_keyboard-support';
import type { DFormControl } from '../form';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useAsync, useElement, useEvent, useEventCallback, useForkRef, useResize } from '@react-devui/hooks';
import { CloseCircleFilled, SwapRightOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { usePrefixConfig, useTranslation, useMaxIndex, useLayout } from '../../hooks';
import { TTANSITION_DURING_POPUP } from '../../utils';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DComboboxKeyboardSupport } from '../_keyboard-support';
import { DTransition } from '../_transition';

export interface DDateInputRef {
  updatePosition: () => void;
}

export interface DDateInputRenderProps {
  diPopupRef: React.MutableRefObject<any>;
  diStyle: React.CSSProperties;
  diOnMouseDown: React.MouseEventHandler;
  diOnMouseUp: React.MouseEventHandler;
}

export interface DDateInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DDateInputRenderProps) => JSX.Element | null;
  dClassNamePrefix: string;
  dFormControl?: DFormControl;
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dSuffix?: React.ReactNode;
  dSize?: DSize;
  dRange?: boolean;
  dClearable?: boolean;
  dDisabled?: boolean;
  dInputProps?: [React.InputHTMLAttributes<HTMLInputElement>?, React.InputHTMLAttributes<HTMLInputElement>?];
  dInputRef?: [React.Ref<HTMLInputElement>?, React.Ref<HTMLInputElement>?];
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

function DateInput(props: DDateInputProps, ref: React.ForwardedRef<DDateInputRef>): JSX.Element | null {
  const {
    children,
    dClassNamePrefix,
    dFormControl,
    dVisible = false,
    dPlacement = 'bottom-left',
    dSuffix,
    dSize,
    dRange = false,
    dClearable = false,
    dDisabled = false,
    dInputProps,
    dInputRef,
    onVisibleChange,
    afterVisibleChange,
    onClear,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLElement>(null);
  const inputRefLeft = useRef<HTMLInputElement>(null);
  const inputRefRight = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const [dInputRefLeft, dInputRefRight] = dInputRef ?? [];
  const combineInputRefLeft = useForkRef(inputRefLeft, dInputRefLeft);
  const combineInputRefRight = useForkRef(inputRefRight, dInputRefRight);

  const async = useAsync();
  const [t] = useTranslation();

  const [isFocus, setIsFocus] = useState(false);
  const handleFocusChange = (focus: boolean) => {
    dataRef.current.clearTid?.();
    if (focus) {
      setIsFocus(true);
    } else {
      dataRef.current.clearTid = async.setTimeout(() => {
        setIsFocus(false);
        onVisibleChange?.(false);
      }, 20);
    }
  };

  const clearable = dClearable && !dVisible && !dDisabled;

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const containerEl = useElement(() => {
    let el = document.getElementById(`${prefix}-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${prefix}-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const maxZIndex = useMaxIndex(dVisible);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (dVisible) {
      if (boxRef.current && popupRef.current) {
        const { width, height } = getOriginalSize(popupRef.current);
        const { top, left, transformOrigin } = getVerticalSidePosition(boxRef.current, { width, height }, dPlacement, 8);
        setPopupPositionStyle({
          top,
          left,
        });
        setTransformOrigin(transformOrigin);
      }
    }
  });

  useResize(boxRef.current, updatePosition);
  useResize(popupRef.current, updatePosition);
  useResize(resizeEl, updatePosition);
  useEvent(scrollEl, 'scroll', updatePosition, { passive: true });

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.target !== inputRefLeft.current && e.target !== inputRefRight.current && e.button === 0) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (boxRef.current && indicatorRef.current) {
      let focus = false;
      const boxRect = boxRef.current.getBoundingClientRect();
      if (inputRefLeft.current && document.activeElement === inputRefLeft.current) {
        const rect = inputRefLeft.current.getBoundingClientRect();
        indicatorRef.current.style.cssText = `left:${rect.left - boxRect.left}px;width:${rect.width}px;opacity:1;`;
        focus = true;
      }
      if (inputRefRight.current && document.activeElement === inputRefRight.current) {
        const rect = inputRefRight.current.getBoundingClientRect();
        indicatorRef.current.style.cssText = `left:${rect.left - boxRect.left}px;width:${rect.width}px;opacity:1;`;
        focus = true;
      }
      if (!focus) {
        indicatorRef.current.style.cssText += 'opacity:0;';
      }
    }
  });

  const getInputNode = (isLeft: boolean, ksProps: DComboboxKeyboardSupportRenderProps) => {
    const [dInputPropsLeft, dInputPropsRight] = dInputProps ?? [];
    const inputProps = isLeft ? dInputPropsLeft : dInputPropsRight;

    return (
      <DBaseInput
        {...inputProps}
        ref={isLeft ? combineInputRefLeft : combineInputRefRight}
        className={getClassName(inputProps?.className, `${prefix}__input`)}
        type="text"
        autoComplete="off"
        disabled={dDisabled}
        onFocus={(e) => {
          inputProps?.onFocus?.(e);

          handleFocusChange(true);
        }}
        onBlur={(e) => {
          inputProps?.onBlur?.(e);

          handleFocusChange(false);
        }}
        onKeyDown={(e) => {
          inputProps?.onKeyDown?.(e);
          ksProps.ksOnKeyDown(e);
        }}
        dFormControl={dFormControl}
        dFor={isLeft}
      />
    );
  };

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  return (
    <>
      <DComboboxKeyboardSupport dVisible={dVisible} dEditable onVisibleChange={onVisibleChange}>
        {(ksProps) => (
          <DBaseDesign dCompose={{ active: isFocus, disabled: dDisabled }} dFormControl={dFormControl}>
            <div
              {...restProps}
              ref={boxRef}
              className={getClassName(restProps.className, prefix, {
                [`${prefix}--${dSize}`]: dSize,
                'is-disabled': dDisabled,
                'is-focus': isFocus,
              })}
              onMouseDown={(e) => {
                restProps.onMouseDown?.(e);

                preventBlur(e);
              }}
              onMouseUp={(e) => {
                restProps.onMouseUp?.(e);

                preventBlur(e);
              }}
              onClick={(e) => {
                restProps.onClick?.(e);

                onVisibleChange?.(true);
                if (!isFocus) {
                  inputRefLeft.current?.focus({ preventScroll: true });
                }
              }}
            >
              {getInputNode(true, ksProps)}
              {dRange && (
                <>
                  <div ref={indicatorRef} className={`${prefix}__indicator`}></div>
                  <SwapRightOutlined className={`${prefix}__separator`} />
                  {getInputNode(false, ksProps)}
                </>
              )}
              {clearable && (
                <div
                  className={`${prefix}__clear`}
                  role="button"
                  aria-label={t('Clear')}
                  onClick={(e) => {
                    e.stopPropagation();

                    onClear?.();
                  }}
                >
                  <CloseCircleFilled />
                </div>
              )}
              {checkNodeExist(dSuffix) && (
                <div className={`${prefix}__icon`} style={{ opacity: clearable ? 0 : 1 }}>
                  {dSuffix}
                </div>
              )}
            </div>
          </DBaseDesign>
        )}
      </DComboboxKeyboardSupport>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition
            dIn={dVisible}
            dDuring={TTANSITION_DURING_POPUP}
            onEnterRendered={updatePosition}
            afterEnter={() => {
              afterVisibleChange?.(true);
            }}
            afterLeave={() => {
              afterVisibleChange?.(false);
            }}
          >
            {(state) => {
              let transitionStyle: React.CSSProperties = {};
              switch (state) {
                case 'enter':
                  transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
                  break;

                case 'entering':
                  transitionStyle = {
                    transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scaleY(0.7)',
                    opacity: 0,
                    transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-in`).join(', '),
                    transformOrigin,
                  };
                  break;

                case 'leaved':
                  transitionStyle = { display: 'none' };
                  break;

                default:
                  break;
              }

              return children({
                diPopupRef: popupRef,
                diStyle: {
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex: maxZIndex,
                },
                diOnMouseDown: preventBlur,
                diOnMouseUp: preventBlur,
              });
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}

export const DDateInput = React.forwardRef(DateInput);
