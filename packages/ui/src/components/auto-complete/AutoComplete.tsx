import type { DNestedChildren } from '../../utils/global';
import type { DFocusVisibleRenderProps } from '../_focus-visible';
import type { DComboboxKeyboardSupportRenderProps } from '../_keyboard-support';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';

import { isUndefined } from 'lodash';
import React, { useState, useId, useCallback, useRef, useImperativeHandle, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useTranslation,
  useEventCallback,
  useElement,
  useMaxIndex,
  useAsync,
  useDValue,
  useLayout,
} from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { TTANSITION_DURING_POPUP } from '../../utils/global';
import { DFocusVisible } from '../_focus-visible';
import { DComboboxKeyboardSupport } from '../_keyboard-support';
import { DTransition } from '../_transition';
import { DInput } from '../input';
import { DVirtualScroll } from '../virtual-scroll';

export interface DAutoCompleteRef {
  updatePosition: () => void;
}

export interface DAutoCompleteItem {
  value: string;
  disabled?: boolean;
}

export interface DAutoCompleteProps<T extends DAutoCompleteItem> extends React.HTMLAttributes<HTMLDivElement> {
  dList: DNestedChildren<T>[];
  dVisible?: boolean;
  dLoading?: boolean;
  dCustomItem?: (item: DNestedChildren<T>) => React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onItemClick?: (value: string, item: T) => void;
  onScrollBottom?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAutoComplete' });
function AutoComplete<T extends DAutoCompleteItem>(
  props: DAutoCompleteProps<T>,
  ref: React.ForwardedRef<DAutoCompleteRef>
): JSX.Element | null {
  const {
    children,
    dList,
    dVisible,
    dLoading = false,
    dCustomItem,
    onVisibleChange,
    afterVisibleChange,
    onItemClick,
    onScrollBottom,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();
  const asyncCapture = useAsync();

  const uniqueId = useId();
  const listId = `${dPrefix}auto-complete-list-${uniqueId}`;
  const getGroupId = (val: string) => `${dPrefix}auto-complete-group-${val}-${uniqueId}`;
  const getItemId = (val: string) => `${dPrefix}auto-complete-item-${val}-${uniqueId}`;

  const scrollEl = useElement(dScrollEl);
  const resizeEl = useElement(dResizeEl);
  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}auto-complete-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}auto-complete-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const canSelectItem = useCallback((item: DNestedChildren<T>) => !item.disabled && !item.children, []);

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

  const [_focusItem, setFocusItem] = useState<DNestedChildren<T> | undefined>();
  const focusItem = (() => {
    if (_focusItem && findNested(dList, (item) => canSelectItem(item) && item.value === _focusItem.value)) {
      return _focusItem;
    }

    return findNested(dList, (item) => canSelectItem(item));
  })();

  const changeFocusItem = (item?: DNestedChildren<T>) => {
    if (!isUndefined(item)) {
      setFocusItem(item);
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

  useEffect(() => {
    if (visible && scrollEl) {
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
  }, [asyncCapture, visible, scrollEl, updatePosition]);

  useEffect(() => {
    if (visible && resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        updatePosition();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, visible, resizeEl, updatePosition]);

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
    ksProps: DComboboxKeyboardSupportRenderProps,
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  ): React.InputHTMLAttributes<HTMLInputElement> => ({
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-expanded': visible,
    'aria-controls': listId,
    onFocus: (e) => {
      inputProps?.onFocus?.(e);
      fvProps.fvOnFocus(e);
    },
    onBlur: (e) => {
      inputProps?.onBlur?.(e);
      fvProps.fvOnBlur(e);

      changeVisible(false);
    },
    onClick: (e) => {
      inputProps?.onClick?.(e);

      changeVisible(true);
    },
    onKeyDown: (e) => {
      inputProps?.onKeyDown?.(e);
      fvProps.fvOnKeyDown(e);
      ksProps.ksOnKeyDown(e);

      if (e.code === 'Enter' && visible && focusItem) {
        changeVisible(false);
        onItemClick?.(focusItem.value, focusItem);
      }
    },
  });

  const vsPerformance = useMemo<DVirtualScrollPerformance<DNestedChildren<T>>>(
    () => ({
      dList,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children,
        emptySize: 32,
        asItem: false,
      }),
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, dList]
  );

  return (
    <>
      <DFocusVisible onFocusVisibleChange={setFocusVisible}>
        {(fvProps) => (
          <DComboboxKeyboardSupport
            dVisible={visible}
            dEditable
            onVisibleChange={changeVisible}
            onFocusChange={(key) => {
              switch (key) {
                case 'next':
                  changeFocusItem(dVSRef.current?.scrollByStep(1));
                  break;

                case 'prev':
                  changeFocusItem(dVSRef.current?.scrollByStep(-1));
                  break;

                case 'first':
                  changeFocusItem(dVSRef.current?.scrollToStart());
                  break;

                case 'last':
                  changeFocusItem(dVSRef.current?.scrollToEnd());
                  break;

                default:
                  break;
              }
            }}
          >
            {(ksProps) => {
              const childProps = {
                ...child.props,
                'data-auto-complete-boxid': uniqueId,
              };
              if (child.type === DInput) {
                childProps.dInputProps = getInputProps(fvProps, ksProps, child.props.dInputProps);
              } else {
                Object.assign(childProps, getInputProps(fvProps, ksProps, child.props));
              }
              return React.cloneElement(child, childProps);
            }}
          </DComboboxKeyboardSupport>
        )}
      </DFocusVisible>
      {containerEl &&
        ReactDOM.createPortal(
          <DTransition
            dIn={visible}
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

              return (
                <div
                  {...restProps}
                  ref={popupRef}
                  className={getClassName(restProps.className, `${dPrefix}auto-complete`)}
                  style={{ ...restProps.style, ...popupPositionStyle, ...transitionStyle, zIndex: maxZIndex }}
                  onMouseDown={(e) => {
                    restProps.onMouseDown?.(e);

                    preventBlur(e);
                  }}
                  onMouseUp={(e) => {
                    restProps.onMouseUp?.(e);

                    preventBlur(e);
                  }}
                >
                  {dLoading && (
                    <div
                      className={getClassName(`${dPrefix}auto-complete__loading`, {
                        [`${dPrefix}auto-complete__loading--empty`]: dList.length === 0,
                      })}
                    >
                      <LoadingOutlined dSize={dList.length === 0 ? 18 : 24} dSpin />
                    </div>
                  )}
                  <DVirtualScroll
                    {...vsPerformance}
                    ref={dVSRef}
                    dFillNode={<li></li>}
                    dItemRender={(item, index, { iARIA, iChildren }, parent) => {
                      const { value: itemValue, disabled: itemDisabled, children } = item;

                      const itemNode = dCustomItem ? dCustomItem(item) : itemValue;

                      if (children) {
                        return (
                          <ul
                            key={itemValue}
                            className={`${dPrefix}auto-complete__option-group`}
                            role="group"
                            aria-labelledby={getGroupId(itemValue)}
                          >
                            <li
                              key={itemValue}
                              id={getGroupId(itemValue)}
                              className={`${dPrefix}auto-complete__option-group-label`}
                              role="presentation"
                            >
                              <div className={`${dPrefix}auto-complete__option-content`}>{itemNode}</div>
                            </li>
                            {iChildren}
                          </ul>
                        );
                      }

                      return (
                        <li
                          {...iARIA}
                          key={itemValue}
                          id={getItemId(itemValue)}
                          className={getClassName(`${dPrefix}auto-complete__option`, {
                            'is-disabled': itemDisabled,
                          })}
                          style={{ paddingLeft: parent.length === 0 ? undefined : 12 + 8 }}
                          title={itemValue}
                          role="option"
                          aria-selected={false}
                          aria-disabled={itemDisabled}
                          onClick={() => {
                            if (!itemDisabled) {
                              changeFocusItem(item);
                              changeVisible(false);
                              onItemClick?.(itemValue, item);
                            }
                          }}
                        >
                          {focusVisible && focusItem?.value === itemValue && <div className={`${dPrefix}focus-outline`}></div>}
                          <div className={`${dPrefix}auto-complete__option-content`}>{itemNode}</div>
                        </li>
                      );
                    }}
                    dFocusItem={focusItem}
                    dSize={264}
                    dPadding={4}
                    dEmptyRender={() => (
                      <li className={`${dPrefix}auto-complete__empty`} style={{ paddingLeft: 12 + 8 }}>
                        <div className={`${dPrefix}auto-complete__option-content`}>{t('No Data')}</div>
                      </li>
                    )}
                    onScrollEnd={onScrollBottom}
                  >
                    {({ vsScrollRef, vsRender, vsOnScroll }) => (
                      <ul
                        ref={vsScrollRef}
                        id={listId}
                        className={`${dPrefix}auto-complete__list`}
                        tabIndex={-1}
                        role="listbox"
                        aria-activedescendant={isUndefined(focusItem) ? undefined : getItemId(focusItem.value)}
                        onScroll={vsOnScroll}
                      >
                        {dList.length === 0 ? (
                          <li className={`${dPrefix}auto-complete__empty`}>
                            <div className={`${dPrefix}auto-complete__option-content`}>{t('No Data')}</div>
                          </li>
                        ) : (
                          vsRender
                        )}
                      </ul>
                    )}
                  </DVirtualScroll>
                </div>
              );
            }}
          </DTransition>,
          containerEl
        )}
    </>
  );
}

export const DAutoComplete: <T extends DAutoCompleteItem>(
  props: DAutoCompleteProps<T> & React.RefAttributes<DAutoCompleteRef>
) => ReturnType<typeof AutoComplete> = React.forwardRef(AutoComplete) as any;
