import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useId, useImperativeHandle, useRef, useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { filter } from 'rxjs';

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
import { ICON_SIZE } from '../../utils/global';
import { DBaseDesign } from '../_base-design';
import { DBaseInput } from '../_base-input';
import { DFocusVisible } from '../_focus-visible';
import { DTransition } from '../_transition';

export type DExtendsSelectboxProps = Pick<
  DSelectboxProps,
  | 'dFormControl'
  | 'dPlaceholder'
  | 'dSize'
  | 'dLoading'
  | 'dSearchable'
  | 'dClearable'
  | 'dDisabled'
  | 'dInputProps'
  | 'dInputRef'
  | 'onClear'
  | 'onVisibleChange'
>;

export interface DSelectboxRef {
  updatePosition: () => void;
}

export interface DSelectboxRenderProps {
  sStyle: React.CSSProperties;
  'data-selectbox-popupid': string;
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
  dDisabled?: boolean;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onUpdatePosition: (el: HTMLDivElement) => { position: React.CSSProperties; transformOrigin?: string } | undefined;
  onVisibleChange?: (visible: boolean) => void;
  onFocusVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

const TTANSITION_DURING = 116;
function Selectbox(props: DSelectboxProps, ref: React.ForwardedRef<DSelectboxRef>) {
  const {
    children,
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
    onUpdatePosition,
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
  const inputRef = useRef<HTMLInputElement>(null);
  //#endregion

  const combineInputRef = useForkRef(dInputRef, inputRef);

  const asyncCapture = useAsync();
  const [t] = useTranslation();

  const uniqueId = useId();

  const [isFocus, setIsFocus] = useState(false);

  const inputable = dSearchable && dVisible;
  const clearable = dClearable && !dVisible && !dLoading && !dDisabled && dContent;

  const iconSize = ICON_SIZE(dSize);

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
    if (boxRef.current) {
      const res = onUpdatePosition(boxRef.current);
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

      const popupEl = document.querySelector(`[data-selectbox-popupid="${uniqueId}"]`) as HTMLElement | null;
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
                aria-controls={dInputProps?.['aria-controls']}
                dFormControl={dFormControl}
                onChange={(e) => {
                  dInputProps?.onChange?.(e);

                  if (dSearchable) {
                    onVisibleChange?.(true);
                  }
                }}
                onKeyDown={(e) => {
                  dInputProps?.onKeyDown?.(e);

                  if (!dVisible) {
                    if (e.code === 'Space' || e.code === 'Enter') {
                      e.preventDefault();

                      onVisibleChange?.(true);
                    }
                  }
                }}
                onFocus={(e) => {
                  dInputProps?.onFocus?.(e);

                  setIsFocus(true);
                }}
                onBlur={(e) => {
                  dInputProps?.onBlur?.(e);

                  setIsFocus(false);
                  onVisibleChange?.(false);
                }}
              />
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
          <div
            className={getClassName(`${dPrefix}selectbox__icon`, {
              'is-arrow-up': !dLoading && !inputable && dVisible,
            })}
            style={{
              fontSize: iconSize,
              opacity: clearable ? 0 : 1,
            }}
          >
            {dLoading ? <LoadingOutlined dSpin /> : inputable ? <SearchOutlined /> : <DownOutlined />}
          </div>
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
                'data-selectbox-popupid': uniqueId,
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
