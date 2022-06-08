import type { DSize } from '../../utils/global';
import type { DFormControl } from '../form';

import React, { useId, useRef, useState } from 'react';
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
  useFocusVisible,
  useGeneralContext,
} from '../../hooks';
import { CloseCircleFilled, DownOutlined, LoadingOutlined, SearchOutlined } from '../../icons';
import { getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DBaseInput } from '../_base-input';
import { DBaseSupport } from '../_base-support';
import { DTransition } from '../_transition';

export type DExtendsSelectboxProps = Pick<
  DSelectboxProps,
  'dFormControl' | 'dPlaceholder' | 'dDisabled' | 'dSearchable' | 'dSize' | 'dLoading' | 'onClear' | 'onVisibleChange'
>;

export interface DSelectboxRenderProps {
  'data-selectbox-popupid': string;
  sOnMouseDown: React.MouseEventHandler;
  sOnMouseUp: React.MouseEventHandler;
  sStyle: React.CSSProperties;
}

export interface DSelectboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: (props: DSelectboxRenderProps) => JSX.Element | null;
  dFormControl?: DFormControl;
  dVisible?: boolean;
  dContent?: React.ReactNode;
  dContentTitle?: string;
  dPlaceholder?: string;
  dSuffix?: React.ReactNode;
  dAutoMaxWidth?: boolean;
  dCustomWidth?: boolean;
  dSize?: DSize;
  dSearchable?: boolean;
  dShowClear?: boolean;
  dDisabled?: boolean;
  dLoading?: boolean;
  dInputProps: React.InputHTMLAttributes<HTMLInputElement> & { 'aria-controls': string };
  onVisibleChange?: (visible: boolean) => void;
  onFocusVisibleChange?: (visible: boolean) => void;
  onClear?: () => void;
}

const TTANSITION_DURING = 116;
export function DSelectbox(props: DSelectboxProps): JSX.Element | null {
  const {
    children,
    dFormControl,
    dVisible = false,
    dContent,
    dContentTitle,
    dPlaceholder,
    dSuffix,
    dAutoMaxWidth = false,
    dCustomWidth = false,
    dSize,
    dSearchable = false,
    dShowClear = false,
    dLoading = false,
    dDisabled = false,
    dInputProps,
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
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  //#endregion

  const asyncCapture = useAsync();
  const [t] = useTranslation();
  const { fvOnFocus, fvOnBlur, fvOnKeyDown } = useFocusVisible(onFocusVisibleChange);

  const uniqueId = useId();

  const [searchValue, setSearchValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled;

  const showClear = !dVisible && !dLoading && !disabled && dShowClear;

  const iconSize = size === 'smaller' ? 12 : size === 'larger' ? 16 : 14;

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

  const changeVisible = useEventCallback((visible: boolean) => {
    onVisibleChange?.(visible);
  });

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    const popupEl = document.querySelector(`[data-selectbox-popupid="${uniqueId}"]`) as HTMLElement | null;
    if (boxRef.current && popupEl) {
      const width = boxRef.current.getBoundingClientRect().width;
      const { height } = getNoTransformSize(popupEl);
      const { top, left, transformOrigin } = getVerticalSidePosition(boxRef.current, { width, height }, 'bottom-left', 8);
      setPopupPositionStyle({
        top,
        left,
        width: dCustomWidth ? undefined : width,
        maxWidth: dAutoMaxWidth ? window.innerWidth - left - 20 : undefined,
      });
      setTransformOrigin(transformOrigin);
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

      const popupEl = document.querySelector(`[data-selectbox-popupid="${uniqueId}"]`) as HTMLElement | null;
      if (popupEl) {
        asyncGroup.onResize(popupEl, () => {
          updatePosition();
        });
      }

      asyncGroup.onGlobalScroll(() => {
        updatePosition();
      });

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
            changeVisible(false);
          },
        });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, changeVisible, dVisible]);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  return (
    <>
      <DBaseSupport dCompose={{ active: isFocus, disabled: disabled }} dFormControl={dFormControl}>
        <div
          {...restProps}
          ref={boxRef}
          className={getClassName(className, `${dPrefix}selectbox`, {
            [`${dPrefix}selectbox--${size}`]: size,
            'is-expanded': dVisible,
            'is-disabled': disabled,
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

            changeVisible(!dVisible);
            searchRef.current?.focus({ preventScroll: true });
          }}
        >
          <div className={`${dPrefix}selectbox__container`} title={dContentTitle}>
            <DBaseInput
              {...dInputProps}
              ref={searchRef}
              className={getClassName(`${dPrefix}selectbox__search`, dInputProps?.className)}
              style={{
                ...dInputProps?.style,
                opacity: dSearchable && dVisible ? undefined : 0,
                zIndex: dSearchable && dVisible ? undefined : -1,
              }}
              type="text"
              autoComplete="off"
              value={searchValue}
              disabled={disabled}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={dVisible}
              aria-controls={dInputProps['aria-controls']}
              dFormControl={dFormControl}
              onChange={(e) => {
                dInputProps?.onChange?.(e);

                setSearchValue(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                dInputProps?.onKeyDown?.(e);
                fvOnKeyDown(e);

                if (!dVisible) {
                  if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();

                    changeVisible(true);
                  }
                }
              }}
              onFocus={(e) => {
                dInputProps?.onFocus?.(e);
                fvOnFocus();

                setIsFocus(true);
              }}
              onBlur={(e) => {
                dInputProps?.onBlur?.(e);
                fvOnBlur();

                setIsFocus(false);
                changeVisible(false);
              }}
            />
            {!(dSearchable && dVisible) && dContent && <div className={`${dPrefix}selectbox__content`}>{dContent}</div>}
            {!(dSearchable && dVisible) && !dContent && dPlaceholder && (
              <div className={`${dPrefix}selectbox__placeholder-wrapper`}>
                <div className={`${dPrefix}selectbox__placeholder`}>{dPlaceholder}</div>
              </div>
            )}
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
          {showClear && (
            <button
              className={getClassName(`${dPrefix}icon-button`, `${dPrefix}selectbox__clear`)}
              style={{ width: iconSize, height: iconSize }}
              aria-label={t('Common', 'Clear')}
              onClick={onClear}
            >
              <CloseCircleFilled dSize="0.8em" />
            </button>
          )}
          <div
            className={getClassName(`${dPrefix}selectbox__icon`, {
              'is-expand': !dLoading && !dSearchable && dVisible,
            })}
            style={{
              fontSize: iconSize,
              opacity: showClear ? 0 : 1,
            }}
          >
            {dLoading ? <LoadingOutlined dSpin /> : dSearchable && dVisible ? <SearchOutlined /> : <DownOutlined />}
          </div>
        </div>
      </DBaseSupport>
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
                sOnMouseDown: (e) => {
                  preventBlur(e);
                },
                sOnMouseUp: (e) => {
                  preventBlur(e);
                },
              });
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}
