import type { DInputProps } from '../input';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';

import { isUndefined } from 'lodash';
import React, { useState, useCallback, useRef, useImperativeHandle, useMemo } from 'react';
import ReactDOM from 'react-dom';

import { useEvent, useEventCallback, useId, useRefExtra, useResize } from '@react-devui/hooks';
import { LoadingOutlined } from '@react-devui/icons';
import { findNested, getClassName, getVerticalSidePosition } from '@react-devui/utils';

import { useMaxIndex, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DFocusVisible } from '../_focus-visible';
import { DComboboxKeyboard } from '../_keyboard';
import { DTransition } from '../_transition';
import { DInput } from '../input';
import { useComponentConfig, useGlobalScroll, useLayout, usePrefixConfig, useTranslation } from '../root';
import { DVirtualScroll } from '../virtual-scroll';

export interface DAutoCompleteRef {
  updatePosition: () => void;
}

export interface DAutoCompleteItem {
  value: string;
  disabled?: boolean;
  children?: DAutoCompleteItem[];
}

export interface DAutoCompleteProps<T extends DAutoCompleteItem> extends React.HTMLAttributes<HTMLDivElement> {
  dList: T[];
  dVisible?: boolean;
  dLoading?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (value: string, item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DAutoComplete' as const });
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
    onItemClick,
    onScrollBottom,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const boxRef = useRefExtra<HTMLElement>(() => document.querySelector(`[data-auto-complete-box="${uniqueId}"]`));
  const popupRef = useRef<HTMLDivElement>(null);
  const vsRef = useRef<DVirtualScrollRef<T>>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}auto-complete-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}auto-complete-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}auto-complete-list-${uniqueId}`;
  const getGroupId = (val: string) => `${dPrefix}auto-complete-group-${val}-${uniqueId}`;
  const getItemId = (val: string) => `${dPrefix}auto-complete-item-${val}-${uniqueId}`;

  const canSelectItem = useCallback((item: T) => !item.disabled && !item.children, []);

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const [focusVisible, setFocusVisible] = useState(false);

  const maxZIndex = useMaxIndex(visible);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: '-200vh',
    left: '-200vw',
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (visible && boxRef.current && popupRef.current) {
      const boxWidth = boxRef.current.offsetWidth;
      const height = popupRef.current.offsetHeight;
      const maxWidth = window.innerWidth - WINDOW_SPACE * 2;
      const width = Math.min(Math.max(popupRef.current.scrollWidth, boxWidth), maxWidth);
      const { top, left, transformOrigin } = getVerticalSidePosition(
        boxRef.current,
        { width, height },
        {
          placement: 'bottom-left',
          inWindow: WINDOW_SPACE,
        }
      );

      setPopupPositionStyle({
        top,
        left,
        minWidth: Math.min(boxWidth, maxWidth),
        maxWidth,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  const [_focusItem, setFocusItem] = useState<T | undefined>();
  const focusItem = (() => {
    if (_focusItem && findNested(dList, (item) => canSelectItem(item) && item.value === _focusItem.value)) {
      return _focusItem;
    }

    return findNested(dList, (item) => canSelectItem(item));
  })();

  const changeFocusItem = (item?: T) => {
    if (!isUndefined(item)) {
      setFocusItem(item);
    }
  };

  const globalScroll = useGlobalScroll(updatePosition, !visible);
  useEvent(dPageScrollRef, 'scroll', updatePosition, { passive: true }, !visible || globalScroll);

  useResize(boxRef, updatePosition, !visible);
  useResize(popupRef, updatePosition, !visible);
  useResize(dContentResizeRef, updatePosition, !visible);

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

  const vsPerformance = useMemo<DVirtualScrollPerformance<T>>(
    () => ({
      dList,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children as T[],
        emptySize: 32,
        inAriaSetsize: false,
      }),
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, dList]
  );

  return (
    <>
      <DFocusVisible onFocusVisibleChange={setFocusVisible}>
        {({ render: renderFocusVisible }) => (
          <DComboboxKeyboard
            dVisible={visible}
            dEditable
            dHasSub={false}
            onVisibleChange={changeVisible}
            onFocusChange={(key) => {
              switch (key) {
                case 'next':
                  changeFocusItem(vsRef.current?.scrollToStep(1));
                  break;

                case 'prev':
                  changeFocusItem(vsRef.current?.scrollToStep(-1));
                  break;

                case 'first':
                  changeFocusItem(vsRef.current?.scrollToStart());
                  break;

                case 'last':
                  changeFocusItem(vsRef.current?.scrollToEnd());
                  break;

                default:
                  break;
              }
            }}
          >
            {({ render: renderComboboxKeyboard }) => {
              const renderInput = (el: React.ReactElement<React.HTMLAttributes<HTMLElement>>, props?: React.HTMLAttributes<HTMLElement>) =>
                renderFocusVisible(
                  renderComboboxKeyboard(
                    cloneHTMLElement(el, {
                      ...props,
                      role: 'combobox',
                      'aria-autocomplete': 'list',
                      'aria-expanded': visible,
                      'aria-controls': listId,
                      onBlur: (e) => {
                        el.props.onBlur?.(e);

                        changeVisible(false);
                      },
                      onClick: (e) => {
                        el.props.onClick?.(e);

                        changeVisible(true);
                      },
                      onKeyDown: (e) => {
                        el.props.onKeyDown?.(e);

                        if (e.code === 'Enter' && !e.shiftKey && visible && focusItem) {
                          changeVisible(false);
                          onItemClick?.(focusItem.value, focusItem);
                        }
                      },
                    })
                  )
                );

              const boxSelector = { ['data-auto-complete-box' as string]: uniqueId };
              if (child.type === DInput) {
                return React.cloneElement<DInputProps>(child, {
                  ...boxSelector,
                  dInputRender: renderInput,
                });
              } else {
                return renderInput(child, boxSelector);
              }
            }}
          </DComboboxKeyboard>
        )}
      </DFocusVisible>
      {containerRef.current &&
        ReactDOM.createPortal(
          <DTransition
            dIn={visible}
            dDuring={TTANSITION_DURING_POPUP}
            onEnter={updatePosition}
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
                  style={{
                    ...restProps.style,
                    ...popupPositionStyle,
                    zIndex: maxZIndex,
                    ...transitionStyle,
                  }}
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
                    ref={vsRef}
                    dFillNode={<li></li>}
                    dItemRender={(item, index, { aria, vsList }, parent) => {
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
                            {vsList}
                          </ul>
                        );
                      }

                      return (
                        <li
                          {...aria}
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
                    {({ render, vsList }) =>
                      render(
                        <ul
                          id={listId}
                          className={`${dPrefix}auto-complete__list`}
                          style={{ pointerEvents: dLoading ? 'none' : undefined }}
                          tabIndex={-1}
                          role="listbox"
                          aria-activedescendant={isUndefined(focusItem) ? undefined : getItemId(focusItem.value)}
                        >
                          {dList.length === 0 ? (
                            <li className={`${dPrefix}auto-complete__empty`}>
                              <div className={`${dPrefix}auto-complete__option-content`}>{t('No Data')}</div>
                            </li>
                          ) : (
                            vsList
                          )}
                        </ul>
                      )
                    }
                  </DVirtualScroll>
                </div>
              );
            }}
          </DTransition>,
          containerRef.current
        )}
    </>
  );
}

export const DAutoComplete: <T extends DAutoCompleteItem>(
  props: DAutoCompleteProps<T> & React.RefAttributes<DAutoCompleteRef>
) => ReturnType<typeof AutoComplete> = React.forwardRef(AutoComplete) as any;
