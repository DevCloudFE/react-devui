import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useTranslation,
  useAsync,
  useForkRef,
  useEventCallback,
  useMaxIndex,
  useElement,
  useUpdatePosition,
} from '../../hooks';
import { CloseCircleFilled, SwapRightOutlined } from '../../icons';
import { getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { ICON_SIZE } from '../../utils/global';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DTransition } from '../_transition';

export interface DDateInputRef {
  updatePosition: () => void;
}

export interface DDateInputRenderProps {
  diStyle: React.CSSProperties;
  'data-date-input-popupid': string;
  diOnMouseDown: React.MouseEventHandler;
  diOnMouseUp: React.MouseEventHandler;
}

export interface DDateInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DDateInputRenderProps) => JSX.Element | null;
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
  onClear?: () => void;
}

const TTANSITION_DURING = 116;
function DateInput(props: DDateInputProps, ref: React.ForwardedRef<DDateInputRef>) {
  const {
    children,
    dFormControl,
    dVisible,
    dSuffix,
    dPlacement = 'bottom-left',
    dSize,
    dRange,
    dClearable,
    dDisabled,
    dInputProps,
    dInputRef,
    onVisibleChange,
    onClear,

    className,
    onMouseDown,
    onMouseUp,
    onClick,
    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRefLeft = useRef<HTMLInputElement>(null);
  const inputRefRight = useRef<HTMLInputElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const [dInputRefLeft, dInputRefRight] = dInputRef ?? [];
  const combineInputRefLeft = useForkRef(inputRefLeft, dInputRefLeft);
  const combineInputRefRight = useForkRef(inputRefRight, dInputRefRight);

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const uniqueId = useId();

  const [isFocus, setIsFocus] = useState(false);
  const handleFocusChange = (focus: boolean) => {
    dataRef.current.clearTid?.();
    if (focus) {
      setIsFocus(true);
    } else {
      dataRef.current.clearTid = asyncCapture.setTimeout(() => {
        setIsFocus(false);
        onVisibleChange?.(false);
      }, 20);
    }
  };

  const iconSize = ICON_SIZE(dSize);
  const clearable = dClearable && !dVisible && !dDisabled;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}date-input-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}date-input-root`;
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
    const popupEl = document.querySelector(`[data-date-input-popupid="${uniqueId}"]`) as HTMLElement | null;
    if (boxRef.current && popupEl) {
      const { width, height } = getNoTransformSize(popupEl);
      const { top, left, transformOrigin } = getVerticalSidePosition(boxRef.current, { width, height }, dPlacement, 8);
      setPopupPositionStyle({
        top,
        left,
        maxWidth: window.innerWidth - left - 20,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  useUpdatePosition(updatePosition, dVisible);

  useEffect(() => {
    if (dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      if (boxRef.current) {
        asyncGroup.onResize(boxRef.current, () => {
          updatePosition();
        });
      }

      const popupEl = document.querySelector(`[data-date-input-popupid="${uniqueId}"]`) as HTMLElement | null;
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          updatePosition();
        });
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dVisible, uniqueId, updatePosition]);

  useEffect(() => {
    if (dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            onVisibleChange?.(false);
          },
        });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, onVisibleChange, dVisible]);

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

  const getInputNode = (isLeft: boolean) => {
    const [dInputPropsLeft, dInputPropsRight] = dInputProps ?? [];
    const inputProps = isLeft ? dInputPropsLeft : dInputPropsRight;

    return (
      <DBaseInput
        {...inputProps}
        ref={isLeft ? combineInputRefLeft : combineInputRefRight}
        className={getClassName(inputProps?.className, `${dPrefix}date-input__input`)}
        type="text"
        autoComplete="off"
        disabled={dDisabled}
        dFormControl={dFormControl}
        dFor={isLeft}
        onChange={(e) => {
          inputProps?.onChange?.(e);

          onVisibleChange?.(true);
        }}
        onKeyDown={(e) => {
          inputProps?.onKeyDown?.(e);

          if (!dVisible) {
            if (e.code === 'Space' || e.code === 'Enter') {
              e.preventDefault();

              onVisibleChange?.(true);
            }
          }
        }}
        onFocus={(e) => {
          inputProps?.onFocus?.(e);

          handleFocusChange(true);
        }}
        onBlur={(e) => {
          inputProps?.onBlur?.(e);

          handleFocusChange(false);
        }}
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
      <DBaseDesign dCompose={{ active: isFocus, disabled: dDisabled }} dFormControl={dFormControl}>
        <div
          {...restProps}
          ref={boxRef}
          className={getClassName(className, `${dPrefix}date-input`, {
            [`${dPrefix}date-input--${dSize}`]: dSize,
            'is-disabled': dDisabled,
            'is-focus': isFocus,
          })}
          onMouseDown={(e) => {
            onMouseDown?.(e);

            preventBlur(e);
          }}
          onMouseUp={(e) => {
            onMouseUp?.(e);

            preventBlur(e);
          }}
          onClick={(e) => {
            onClick?.(e);

            onVisibleChange?.(true);
            if (!isFocus) {
              inputRefLeft.current?.focus({ preventScroll: true });
            }
          }}
        >
          {getInputNode(true)}
          {dRange && (
            <>
              <div ref={indicatorRef} className={`${dPrefix}date-input__indicator`}></div>
              <SwapRightOutlined className={`${dPrefix}date-input__separator`} />
              {getInputNode(false)}
            </>
          )}
          {clearable && (
            <button
              className={getClassName(`${dPrefix}icon-button`, `${dPrefix}date-input__clear`)}
              style={{ width: iconSize, height: iconSize }}
              aria-label={t('Common', 'Clear')}
              onClick={(e) => {
                e.stopPropagation();

                onClear?.();
              }}
            >
              <CloseCircleFilled dSize={iconSize} />
            </button>
          )}
          {dSuffix && (
            <div className={`${dPrefix}date-input__icon`} style={{ opacity: clearable ? 0 : 1, fontSize: iconSize }}>
              {dSuffix}
            </div>
          )}
        </div>
      </DBaseDesign>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition dIn={dVisible} dDuring={TTANSITION_DURING} onEnterRendered={updatePosition}>
            {(state) => {
              let transitionStyle: React.CSSProperties = {};
              switch (state) {
                case 'enter':
                  transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
                  break;

                case 'entering':
                  transitionStyle = {
                    transition: `transform ${TTANSITION_DURING}ms ease-out, opacity ${TTANSITION_DURING}ms ease-out`,
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scaleY(0.7)',
                    opacity: 0,
                    transition: `transform ${TTANSITION_DURING}ms ease-in, opacity ${TTANSITION_DURING}ms ease-in`,
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
                diStyle: {
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex: maxZIndex,
                },
                'data-date-input-popupid': uniqueId,
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
