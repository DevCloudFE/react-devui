import type { DNestedChildren } from '../../utils/global';
import type { DFocusVisibleRenderProps } from '../_focus-visible';
import type { DVirtualScrollRef } from '../_virtual-scroll';

import { isUndefined } from 'lodash';
import React, { useState, useId, useCallback, useMemo, useRef, useImperativeHandle, useEffect } from 'react';
import ReactDOM from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useTranslation,
  useEventCallback,
  useElement,
  useMaxIndex,
  useUpdatePosition,
  useAsync,
  useDValue,
} from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { TTANSITION_DURING_POPUP } from '../../utils/global';
import { DFocusVisible } from '../_focus-visible';
import { DTransition } from '../_transition';
import { DVirtualScroll } from '../_virtual-scroll';
import { DInput } from '../input';

export interface DAutoCompleteRef {
  updatePosition: () => void;
}

export interface DAutoCompleteOption {
  value: string;
  disabled?: boolean;
}

export interface DAutoCompleteProps<T extends DAutoCompleteOption> extends React.HTMLAttributes<HTMLDivElement> {
  dOptions: DNestedChildren<T>[];
  dVisible?: boolean;
  dLoading?: boolean;
  dCustomOption?: (option: DNestedChildren<T>) => React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onOptionClick?: (value: string, option: T) => void;
  onScrollBottom?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAutoComplete' });
function AutoComplete<T extends DAutoCompleteOption>(
  props: DAutoCompleteProps<T>,
  ref: React.ForwardedRef<DAutoCompleteRef>
): JSX.Element | null {
  const {
    children,
    dOptions,
    dVisible,
    dLoading = false,
    dCustomOption,
    onVisibleChange,
    onOptionClick,
    onScrollBottom,

    className,
    style,
    onMouseDown,
    onMouseUp,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();
  const asyncCapture = useAsync();

  const uniqueId = useId();
  const listId = `${dPrefix}auto-complete-list-${uniqueId}`;
  const getOptionId = (val: string) => `${dPrefix}auto-complete-option-${val}-${uniqueId}`;
  const getGroupId = (val: string) => `${dPrefix}auto-complete-group-${val}-${uniqueId}`;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}auto-complete-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}auto-complete-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const canSelectOption = useCallback((option: DNestedChildren<T>) => !option.disabled && !option.children, []);

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const [focusVisible, setFocusVisible] = useState(false);

  const maxZIndex = useMaxIndex(visible);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    const boxEl = document.querySelector(`[data-auto-complete-boxid="${uniqueId}"]`) as HTMLElement | null;
    const popupEl = popupRef.current;
    if (boxEl && popupEl) {
      const width = boxEl.getBoundingClientRect().width;
      const { height } = getNoTransformSize(popupEl);
      const { top, left, transformOrigin } = getVerticalSidePosition(boxEl, { width, height }, 'bottom-left', 8);

      setPopupPositionStyle({
        top,
        left,
        minWidth: width,
        maxWidth: window.innerWidth - left - 20,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  useUpdatePosition(updatePosition, visible);

  const [_focusOption, setFocusOption] = useState<DNestedChildren<T> | undefined>();
  const focusOption = useMemo(() => {
    if (_focusOption && findNested(dOptions, (o) => canSelectOption(o) && o.value === _focusOption.value)) {
      return _focusOption;
    }

    return findNested(dOptions, (o) => canSelectOption(o));
  }, [_focusOption, canSelectOption, dOptions]);

  const changeFocusOption = (option?: DNestedChildren<T>) => {
    if (!isUndefined(option)) {
      setFocusOption(option);
    }
  };

  useEffect(() => {
    if (visible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      const boxEl = document.querySelector(`[data-auto-complete-boxid="${uniqueId}"]`) as HTMLElement | null;
      if (boxEl) {
        asyncGroup.onResize(boxEl, () => {
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
  }, [asyncCapture, uniqueId, updatePosition, visible]);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
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

  const child = React.Children.only(children) as React.ReactElement;
  const getInputProps = (
    fvProps: DFocusVisibleRenderProps,
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  ): React.InputHTMLAttributes<HTMLInputElement> => ({
    role: 'combobox',
    'aria-haspopup': 'listbox',
    'aria-expanded': visible,
    'aria-controls': listId,
    onFocus: (e) => {
      inputProps?.onFocus?.(e);
      fvProps.fvOnFocus(e);

      changeVisible(true);
    },
    onBlur: (e) => {
      inputProps?.onBlur?.(e);
      fvProps.fvOnBlur(e);

      changeVisible(false);
    },
    onKeyDown: (e) => {
      inputProps?.onKeyDown?.(e);
      fvProps.fvOnKeyDown(e);

      if (visible && !isUndefined(focusOption)) {
        switch (e.code) {
          case 'ArrowUp':
            e.preventDefault();
            changeFocusOption(dVSRef.current?.scrollByStep(-1));
            break;

          case 'ArrowDown':
            e.preventDefault();
            changeFocusOption(dVSRef.current?.scrollByStep(1));
            break;

          case 'Home':
            e.preventDefault();
            changeFocusOption(dVSRef.current?.scrollToStart());
            break;

          case 'End':
            e.preventDefault();
            changeFocusOption(dVSRef.current?.scrollToEnd());
            break;

          case 'Enter':
            e.preventDefault();
            onOptionClick?.(focusOption.value, focusOption);
            break;

          default:
            break;
        }
      }
    },
  });

  return (
    <>
      <DFocusVisible onFocusVisibleChange={setFocusVisible}>
        {(fvProps) => {
          const childProps = {
            ...child.props,
            'data-auto-complete-boxid': uniqueId,
          };
          if (child.type === DInput) {
            childProps.dInputProps = getInputProps(fvProps, child.props.dInputProps);
          } else {
            Object.assign(childProps, getInputProps(fvProps, child.props));
          }
          return React.cloneElement(child, childProps);
        }}
      </DFocusVisible>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition dIn={visible} dDuring={TTANSITION_DURING_POPUP} onEnterRendered={updatePosition}>
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

              return (
                <div
                  {...restProps}
                  ref={popupRef}
                  className={getClassName(className, `${dPrefix}select__popup`)}
                  style={{ ...style, ...popupPositionStyle, ...transitionStyle, zIndex: maxZIndex }}
                  onMouseDown={(e) => {
                    onMouseDown?.(e);

                    preventBlur(e);
                  }}
                  onMouseUp={(e) => {
                    onMouseUp?.(e);

                    preventBlur(e);
                  }}
                >
                  {dLoading && (
                    <div
                      className={getClassName(`${dPrefix}select__loading`, {
                        [`${dPrefix}select__loading--empty`]: dOptions.length === 0,
                      })}
                    >
                      <LoadingOutlined dSize={dOptions.length === 0 ? 18 : 24} dSpin />
                    </div>
                  )}
                  <DVirtualScroll
                    ref={dVSRef}
                    id={listId}
                    className={`${dPrefix}select__list`}
                    role="listbox"
                    aria-activedescendant={isUndefined(focusOption) ? undefined : getOptionId(focusOption.value)}
                    dList={dOptions}
                    dItemRender={(item, index, renderProps, parent) => {
                      const { value: optionValue, disabled: optionDisabled, children } = item;

                      const optionNode = dCustomOption ? dCustomOption(item) : optionValue;

                      if (children) {
                        return (
                          <ul
                            key={optionValue}
                            className={`${dPrefix}select__option-group`}
                            role="group"
                            aria-labelledby={getGroupId(optionValue)}
                          >
                            <li
                              key={optionValue}
                              id={getGroupId(optionValue)}
                              className={`${dPrefix}select__option-group-label`}
                              role="presentation"
                            >
                              <div className={`${dPrefix}select__option-content`}>{optionNode}</div>
                            </li>
                            {children.length === 0 ? (
                              <li className={`${dPrefix}select__empty`} style={{ paddingLeft: 12 + 8 }}>
                                <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                              </li>
                            ) : (
                              renderProps.children
                            )}
                          </ul>
                        );
                      }

                      return (
                        <li
                          {...renderProps}
                          key={optionValue}
                          id={getOptionId(optionValue)}
                          className={getClassName(`${dPrefix}select__option`, {
                            'is-disabled': optionDisabled,
                          })}
                          style={{ paddingLeft: parent.length === 0 ? undefined : 12 + 8 }}
                          title={optionValue}
                          role="option"
                          aria-selected={false}
                          aria-disabled={optionDisabled}
                          onClick={() => {
                            if (!optionDisabled) {
                              changeFocusOption(item);
                              onOptionClick?.(optionValue, item);
                            }
                          }}
                        >
                          {focusVisible && focusOption?.value === optionValue && <div className={`${dPrefix}focus-outline`}></div>}
                          <div className={`${dPrefix}select__option-content`}>{optionNode}</div>
                        </li>
                      );
                    }}
                    dGetSize={(item) => {
                      if (item.children && item.children.length === 0) {
                        return 64;
                      }
                      return 32;
                    }}
                    dGetChildren={(item) => item.children}
                    dCompareItem={(a, b) => a.value === b.value}
                    dCanFocus={canSelectOption}
                    dFocusItem={focusOption}
                    dSize={264}
                    dPadding={4}
                    dEmpty={
                      <li className={`${dPrefix}select__empty`}>
                        <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                      </li>
                    }
                    onScrollEnd={onScrollBottom}
                  />
                </div>
              );
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}

export const DAutoComplete: <T extends DAutoCompleteOption>(
  props: DAutoCompleteProps<T> & { ref?: React.ForwardedRef<DAutoCompleteRef> }
) => ReturnType<typeof AutoComplete> = React.forwardRef(AutoComplete) as any;
