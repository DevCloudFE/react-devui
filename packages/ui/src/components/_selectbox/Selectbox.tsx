import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useImperativeHandle, useRef, useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';

import { useAsync, usePrefixConfig, useTranslation, useEventCallback, useElement, useMaxIndex, useForkRef, useLayout } from '../../hooks';
import { CloseCircleFilled, DownOutlined, LoadingOutlined, SearchOutlined } from '../../icons';
import { checkNodeExist, getClassName } from '../../utils';
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
  dClassNamePrefix: string;
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
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  dUpdatePosition?: (boxEl: HTMLElement, popupEl: HTMLElement) => { position: React.CSSProperties; transformOrigin?: string } | undefined;
  afterVisibleChange?: (visible: boolean) => void;
  onFocusVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

function Selectbox(props: DSelectboxProps, ref: React.ForwardedRef<DSelectboxRef>): JSX.Element | null {
  const {
    children,
    dClassNamePrefix,
    dFormControl,
    dVisible = false,
    dContent,
    dContentTitle,
    dPlaceholder,
    dSuffix,
    dSize,
    dLoading = false,
    dSearchable = false,
    dClearable = false,
    dDisabled = false,
    dInputProps,
    dInputRef,
    dUpdatePosition,
    afterVisibleChange,
    onFocusVisibleChange,
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
  const inputRef = useRef<HTMLInputElement>(null);
  //#endregion

  const prefix = `${dPrefix}${dClassNamePrefix}`;

  const combineInputRef = useForkRef(inputRef, dInputRef);

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const [isFocus, setIsFocus] = useState(false);

  const inputable = dSearchable && dVisible;
  const clearable = dClearable && dContent && !dVisible && !dLoading && !dDisabled;

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
    if (boxRef.current && popupRef.current) {
      const res = dUpdatePosition?.(boxRef.current, popupRef.current);
      if (res) {
        setPopupPositionStyle(res.position);
        setTransformOrigin(res.transformOrigin);
      }
    }
  });

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

  useEffect(() => {
    if (dVisible && scrollEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(scrollEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updatePosition();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dVisible, scrollEl, updatePosition]);

  useEffect(() => {
    if (dVisible && resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        updatePosition();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dVisible, resizeEl, updatePosition]);

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
          className={getClassName(restProps.className, prefix, {
            [`${prefix}--${dSize}`]: dSize,
            'is-expanded': dVisible,
            'is-focus': isFocus,
            'is-disabled': dDisabled,
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

            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className={`${prefix}__container`} title={dContentTitle}>
            <DFocusVisible onFocusVisibleChange={onFocusVisibleChange}>
              {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) => (
                <DBaseInput
                  {...dInputProps}
                  ref={combineInputRef}
                  className={getClassName(`${prefix}__search`, dInputProps?.className)}
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
                  onFocus={(e) => {
                    dInputProps?.onFocus?.(e);
                    fvOnFocus(e);

                    setIsFocus(true);
                  }}
                  onBlur={(e) => {
                    dInputProps?.onBlur?.(e);
                    fvOnBlur(e);

                    setIsFocus(false);
                  }}
                  onKeyDown={(e) => {
                    dInputProps?.onKeyDown?.(e);
                    fvOnKeyDown(e);
                  }}
                />
              )}
            </DFocusVisible>
            {!inputable &&
              (dContent ? (
                <div className={`${prefix}__content`}>{dContent}</div>
              ) : dPlaceholder ? (
                <div className={`${prefix}__placeholder-wrapper`}>
                  <div className={`${prefix}__placeholder`}>{dPlaceholder}</div>
                </div>
              ) : null)}
          </div>
          {checkNodeExist(dSuffix) && (
            <div
              className={`${prefix}__suffix`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {dSuffix}
            </div>
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
          <div
            className={getClassName(`${prefix}__icon`, {
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
