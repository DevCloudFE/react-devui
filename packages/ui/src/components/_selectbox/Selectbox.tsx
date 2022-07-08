import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useImperativeHandle, useRef, useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

import {
  useAsync,
  usePrefixConfig,
  useTranslation,
  useEventCallback,
  useElement,
  useMaxIndex,
  useUpdatePosition,
  useForkRef,
} from '../../hooks';
import { CloseCircleFilled, DownOutlined, LoadingOutlined, SearchOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { TTANSITION_DURING_POPUP } from '../../utils/global';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DFocusVisible } from '../_focus-visible';
import { DTransition } from '../_transition';

export interface DSelectboxRef {
  updatePosition: () => void;
}

export interface DSelectboxRenderProps {
  sPopupRef: React.MutableRefObject<any>;
  sStyle: React.CSSProperties;
  sOnMouseDown: React.MouseEventHandler;
  sOnMouseUp: React.MouseEventHandler;
}

export interface DSelectboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DSelectboxRenderProps) => JSX.Element | null;
  dFormControl?: DFormControl;
  dVisible?: boolean;
  dContent?: React.ReactNode;
  dContentTitle?: string;
  dPlaceholder?: string;
  dSuffix?: React.ReactNode;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dClearable?: boolean;
  dEscClosable?: boolean;
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  dUpdatePosition: (boxEl: HTMLElement, popupEl: HTMLElement) => { position: React.CSSProperties; transformOrigin?: string } | undefined;
  onVisibleChange?: (visible: boolean) => void;
  onFocusVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

function Selectbox(props: DSelectboxProps, ref: React.ForwardedRef<DSelectboxRef>): JSX.Element | null {
  const {
    children,
    dFormControl,
    dVisible,
    dContent,
    dContentTitle,
    dPlaceholder,
    dSuffix,
    dSize,
    dLoading,
    dSearchable,
    dClearable,
    dEscClosable = true,
    dDisabled,
    dInputProps,
    dInputRef,
    dUpdatePosition,
    onVisibleChange,
    onFocusVisibleChange,
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
  const popupRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  //#endregion

  const combineInputRef = useForkRef(inputRef, dInputRef);

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const [isFocus, setIsFocus] = useState(false);

  const inputable = dSearchable && dVisible;
  const clearable = dClearable && !dVisible && !dLoading && !dDisabled && dContent;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}selectbox-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}selectbox-root`;
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
    if (boxRef.current && popupRef.current) {
      const res = dUpdatePosition(boxRef.current, popupRef.current);
      if (res) {
        setPopupPositionStyle(res.position);
        setTransformOrigin(res.transformOrigin);
      }
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

      if (popupRef.current) {
        asyncGroup.onResize(popupRef.current, () => {
          updatePosition();
        });
      }

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dVisible, updatePosition]);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.target !== inputRef.current && e.button === 0) {
      e.preventDefault();
    }
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
          className={getClassName(className, `${dPrefix}selectbox`, {
            [`${dPrefix}selectbox--${dSize}`]: dSize,
            'is-expanded': dVisible,
            'is-focus': isFocus,
            'is-disabled': dDisabled,
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

            onVisibleChange?.(dSearchable ? true : !dVisible);
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className={`${dPrefix}selectbox__container`} title={dContentTitle}>
            <DFocusVisible onFocusVisibleChange={onFocusVisibleChange}>
              {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) => (
                <DBaseInput
                  {...dInputProps}
                  ref={combineInputRef}
                  className={getClassName(`${dPrefix}selectbox__search`, dInputProps?.className)}
                  style={{
                    ...dInputProps?.style,
                    opacity: inputable ? undefined : 0,
                    zIndex: inputable ? undefined : -1,
                  }}
                  type="text"
                  autoComplete="off"
                  disabled={dDisabled}
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-expanded={dVisible}
                  dFormControl={dFormControl}
                  onChange={(e) => {
                    dInputProps?.onChange?.(e);

                    if (dSearchable) {
                      onVisibleChange?.(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    dInputProps?.onKeyDown?.(e);
                    fvOnKeyDown(e);

                    if (dVisible) {
                      if (dEscClosable && e.code === 'Escape') {
                        e.preventDefault();

                        onVisibleChange?.(false);
                      }
                    } else {
                      if (e.code === 'Space' || e.code === 'Enter') {
                        e.preventDefault();

                        onVisibleChange?.(true);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    dInputProps?.onFocus?.(e);
                    fvOnFocus(e);

                    setIsFocus(true);
                  }}
                  onBlur={(e) => {
                    dInputProps?.onBlur?.(e);
                    fvOnBlur(e);

                    setIsFocus(false);
                    onVisibleChange?.(false);
                  }}
                />
              )}
            </DFocusVisible>
            {!inputable &&
              (dContent ? (
                <div className={`${dPrefix}selectbox__content`}>{dContent}</div>
              ) : dPlaceholder ? (
                <div className={`${dPrefix}selectbox__placeholder-wrapper`}>
                  <div className={`${dPrefix}selectbox__placeholder`}>{dPlaceholder}</div>
                </div>
              ) : null)}
          </div>
          {dSuffix && (
            <div
              className={`${dPrefix}selectbox__suffix`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {dSuffix}
            </div>
          )}
          {clearable && (
            <button
              className={getClassName(`${dPrefix}icon-button`, `${dPrefix}selectbox__clear`)}
              aria-label={t('Clear')}
              onClick={(e) => {
                e.stopPropagation();

                onClear?.();
              }}
            >
              <CloseCircleFilled />
            </button>
          )}
          <div
            className={getClassName(`${dPrefix}selectbox__icon`, {
              'is-arrow-up': !dLoading && !inputable && dVisible,
            })}
            style={{
              opacity: clearable ? 0 : 1,
            }}
          >
            {dLoading ? <LoadingOutlined dSpin /> : inputable ? <SearchOutlined /> : <DownOutlined />}
          </div>
        </div>
      </DBaseDesign>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition dIn={dVisible} dDuring={TTANSITION_DURING_POPUP} onEnterRendered={updatePosition}>
            {(state) => {
              let transitionStyle: React.CSSProperties = {};
              switch (state) {
                case 'enter':
                  transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
                  break;

                case 'entering':
                  transitionStyle = {
                    transition: `transform ${TTANSITION_DURING_POPUP}ms ease-out, opacity ${TTANSITION_DURING_POPUP}ms ease-out`,
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  transitionStyle = {
                    transform: 'scaleY(0.7)',
                    opacity: 0,
                    transition: `transform ${TTANSITION_DURING_POPUP}ms ease-in, opacity ${TTANSITION_DURING_POPUP}ms ease-in`,
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
                sPopupRef: popupRef,
                sStyle: {
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex: maxZIndex,
                },
                sOnMouseDown: preventBlur,
                sOnMouseUp: preventBlur,
              });
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}

export const DSelectbox = React.forwardRef(Selectbox);
