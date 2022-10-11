import type { DCloneHTMLElement, DId, DSize } from '../../utils/types';
import type { DDropdownItem } from '../dropdown';
import type { DFormControl } from '../form';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';

import { isNull, isUndefined } from 'lodash';
import React, { useState, useCallback, useMemo, useRef, useImperativeHandle } from 'react';

import { useEventCallback, useId } from '@react-devui/hooks';
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@react-devui/icons';
import { findNested, getClassName, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DComboboxKeyboard } from '../_keyboard';
import { DSelectbox } from '../_selectbox';
import { DTransition } from '../_transition';
import { DCheckbox } from '../checkbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DTag } from '../tag';
import { DVirtualScroll } from '../virtual-scroll';

const IS_CREATE = Symbol();

export interface DSelectRef {
  updatePosition: () => void;
}

export interface DSelectItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
  children?: DSelectItem<V>[];
}

export interface DSelectProps<V extends DId, T extends DSelectItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dClearable?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dCreateItem?: (value: string) => T | undefined;
  dPopupClassName?: string;
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onCreateItem?: (item: T) => void;
  onScrollBottom?: () => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSelect' as const });
function Select<V extends DId, T extends DSelectItem<V>>(
  props: DSelectProps<V, T>,
  ref: React.ForwardedRef<DSelectRef>
): JSX.Element | null {
  const {
    dRef,
    dFormControl,
    dList,
    dModel,
    dVisible,
    dPlaceholder,
    dSize,
    dLoading = false,
    dSearchable = false,
    dClearable = false,
    dDisabled = false,
    dMultiple = false,
    dCustomItem,
    dCustomSelected,
    dCustomSearch,
    dCreateItem,
    dPopupClassName,
    dInputRender,
    onModelChange,
    onVisibleChange,
    onClear,
    onSearch,
    onCreateItem,
    onScrollBottom,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const boxRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const vsRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}select-list-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}select-group-${val}-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}select-item-${val}-${uniqueId}`;

  const itemsMap = useMemo(() => {
    const items = new Map<V, T>();
    const reduceArr = (arr: T[]) => {
      for (const item of arr) {
        items.set(item.value, item);
        if (item.children) {
          reduceArr(item.children as T[]);
        }
      }
    };
    reduceArr(dList);
    return items;
  }, [dList]);

  const [searchValue, setSearchValue] = useState('');

  const canSelectItem = useCallback((item: T) => !item.disabled && !item.children, []);

  const [focusVisible, setFocusVisible] = useState(false);

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);
  const formControlInject = useFormControl(dFormControl);
  const [_select, changeSelect] = useDValue<V | null | V[]>(
    dMultiple ? [] : null,
    dModel,
    (value) => {
      if (onModelChange) {
        if (dMultiple) {
          onModelChange(
            value,
            (value as V[]).map((v) => itemsMap.get(v))
          );
        } else {
          onModelChange(value, isNull(value) ? null : itemsMap.get(value as V));
        }
      }
    },
    undefined,
    formControlInject
  );
  const select = useMemo(() => (dMultiple ? new Set(_select as V[]) : (_select as V | null)), [_select, dMultiple]);

  const size = dSize ?? gSize;
  const disabled = (dDisabled || gDisabled || dFormControl?.control.disabled) ?? false;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

  const _filterFn = dCustomSearch?.filter;
  const filterFn = useCallback(
    (item: T) => {
      const defaultFilterFn = (item: T) => {
        return item.label.includes(searchValue);
      };
      return _filterFn ? _filterFn(searchValue, item) : defaultFilterFn(item);
    },
    [_filterFn, searchValue]
  );
  const sortFn = dCustomSearch?.sort;
  const searchList = useMemo(() => {
    if (!hasSearch) {
      return [];
    }

    let createItem = dCreateItem?.(searchValue);
    if (createItem) {
      createItem = {
        ...createItem,
        [IS_CREATE]: true,
      };
    }

    let searchList: (T & { [IS_CREATE]?: boolean })[] = [];

    dList.forEach((item) => {
      if (!item.children) {
        if (createItem && item.value === createItem.value) {
          createItem = undefined;
        }
        if (filterFn(item)) {
          searchList.push(item);
        }
      } else {
        const groupList: T[] = [];
        (item.children as T[]).forEach((groupItem) => {
          if (createItem && groupItem.value === createItem.value) {
            createItem = undefined;
          }
          if (filterFn(groupItem)) {
            groupList.push(groupItem);
          }
        });
        searchList = searchList.concat(groupList);
      }
    });

    if (sortFn) {
      searchList.sort(sortFn);
    }

    if (createItem) {
      searchList.unshift(createItem);
    }

    return searchList;
  }, [dCreateItem, dList, filterFn, hasSearch, searchValue, sortFn]);
  const list = hasSearch ? searchList : dList;

  const [_noSearchFocusItem, setNoSearchFocusItem] = useState<T | undefined>();
  const noSearchFocusItem = (() => {
    let focusItem: T | undefined;

    if (_noSearchFocusItem) {
      focusItem = itemsMap.get(_noSearchFocusItem.value);
      if (focusItem && canSelectItem(focusItem)) {
        return focusItem;
      }
    }

    if (hasSelected) {
      focusItem = findNested(dList, (item) =>
        canSelectItem(item) && dMultiple ? (select as Set<V>).has(item.value) : (select as V) === item.value
      );
    }

    if (isUndefined(focusItem)) {
      focusItem = findNested(dList, (item) => canSelectItem(item));
    }

    return focusItem;
  })();

  const [_searchFocusItem, setSearchFocusItem] = useState<(T & { [IS_CREATE]?: boolean | undefined }) | undefined>();
  const searchFocusItem = (() => {
    if (_searchFocusItem && findNested(searchList, (item) => canSelectItem(item) && item.value === _searchFocusItem.value)) {
      return _searchFocusItem;
    }

    if (hasSearch) {
      return findNested(searchList, (item) => canSelectItem(item));
    }
  })();

  const focusItem = hasSearch ? searchFocusItem : noSearchFocusItem;
  const changeFocusItem = (item?: T) => {
    if (!isUndefined(item)) {
      hasSearch ? setSearchFocusItem(item) : setNoSearchFocusItem(item);
    }
  };

  const createItem = (item?: T) => {
    if (!isUndefined(item)) {
      const newItem = { ...item };
      delete newItem[IS_CREATE];
      onCreateItem?.(newItem);
    }
  };

  const changeSelectByClick = (val: V) => {
    if (dMultiple) {
      changeSelect((draft) => {
        const index = (draft as V[]).findIndex((v) => v === val);
        if (index !== -1) {
          (draft as V[]).splice(index, 1);
        } else {
          (draft as V[]).push(val);
        }
      });
    } else {
      changeSelect(val);
      changeVisible(false);
    }
  };

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (visible && boxRef.current && popupRef.current) {
      const width = Math.min(boxRef.current.getBoundingClientRect().width, window.innerWidth - WINDOW_SPACE * 2);
      const { height } = getOriginalSize(popupRef.current);
      const { top, left, transformOrigin } = getVerticalSidePosition(
        boxRef.current,
        { width, height },
        {
          placement: 'bottom',
          inWindow: WINDOW_SPACE,
        }
      );
      setPopupPositionStyle({
        top,
        left,
        width,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  useImperativeHandle(
    ref,
    () => ({
      updatePosition,
    }),
    [updatePosition]
  );

  const [selectedNode, suffixNode, selectedLabel] = (() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selectedItems: T[] = (_select as V[]).map((v) => itemsMap.get(v)!);

      suffixNode = (
        <DDropdown
          dList={selectedItems.map<DDropdownItem<V>>((item) => {
            const { label: itemLabel, value: itemValue, disabled: itemDisabled } = item;
            const text = dCustomSelected ? dCustomSelected(item) : itemLabel;

            return {
              id: itemValue,
              label: text,
              type: 'item',
              disabled: itemDisabled,
            };
          })}
          dCloseOnClick={false}
          onItemClick={(id: V) => {
            changeSelectByClick(id);
          }}
        >
          <DTag className={`${dPrefix}select__multiple-count`} dSize={size}>
            {(select as Set<V>).size}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedItems.map((item) => (
        <DTag key={item.value} className={`${dPrefix}select__multiple-tag`} dSize={size}>
          {dCustomSelected ? dCustomSelected(item) : item.label}
          {!(item.disabled || disabled) && (
            <div
              className={`${dPrefix}select__close`}
              role="button"
              aria-label={t('Close')}
              onClick={(e) => {
                e.stopPropagation();

                changeSelectByClick(item.value);
              }}
            >
              <CloseOutlined />
            </div>
          )}
        </DTag>
      ));
    } else {
      if (!isNull(select)) {
        const item = itemsMap.get(select as V)!;
        selectedLabel = item.label;
        selectedNode = dCustomSelected ? dCustomSelected(item) : selectedLabel;
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  })();

  const vsPerformance = useMemo<DVirtualScrollPerformance<T>>(
    () => ({
      dList: list,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children as T[],
        emptySize: 32,
        inAriaSetsize: false,
      }),
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, list]
  );

  return (
    <DSelectbox
      {...restProps}
      onClick={(e) => {
        restProps.onClick?.(e);

        changeVisible((draft) => (dSearchable ? true : !draft));
      }}
      dRef={{
        box: boxRef,
        input: dRef?.input,
      }}
      dClassNamePrefix="select"
      dFormControl={dFormControl}
      dVisible={visible}
      dContent={hasSelected && selectedNode}
      dContentTitle={selectedLabel}
      dPlaceholder={dPlaceholder}
      dSuffix={suffixNode}
      dSize={size}
      dLoading={dLoading}
      dSearchable={dSearchable}
      dClearable={dClearable}
      dDisabled={disabled}
      dUpdatePosition={{
        fn: updatePosition,
        popupRef,
        extraScrollRefs: [],
      }}
      dInputRender={(el) => (
        <DComboboxKeyboard
          dVisible={visible}
          dEditable={dSearchable}
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
            const input = renderComboboxKeyboard(
              cloneHTMLElement(el, {
                value: searchValue,
                'aria-controls': listId,
                onBlur: (e) => {
                  el.props.onBlur?.(e);

                  changeVisible(false);
                },
                onKeyDown: (e) => {
                  el.props.onKeyDown?.(e);

                  if ((e.code === 'Enter' || (!dSearchable && e.code === 'Space')) && visible && focusItem) {
                    e.preventDefault();
                    if (focusItem[IS_CREATE]) {
                      createItem(focusItem);
                    }
                    changeSelectByClick(focusItem.value);
                  }
                },
                onChange: (e) => {
                  el.props.onChange?.(e);

                  const val = e.currentTarget.value;
                  if (dSearchable) {
                    setSearchValue(val);
                    onSearch?.(val);
                  }
                },
              })
            );

            return isUndefined(dInputRender) ? input : dInputRender(input);
          }}
        </DComboboxKeyboard>
      )}
      onFocusVisibleChange={setFocusVisible}
      onClear={() => {
        onClear?.();

        if (dMultiple) {
          changeSelect([]);
        } else {
          changeSelect(null);
        }
      }}
    >
      {({ renderPopup }) => (
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

            return renderPopup(
              <div
                ref={popupRef}
                className={getClassName(dPopupClassName, `${dPrefix}select__popup`)}
                style={{
                  ...popupPositionStyle,
                  ...transitionStyle,
                }}
              >
                {dLoading && (
                  <div
                    className={getClassName(`${dPrefix}select__loading`, {
                      [`${dPrefix}select__loading--empty`]: list.length === 0,
                    })}
                  >
                    <LoadingOutlined dSize={list.length === 0 ? 18 : 24} dSpin />
                  </div>
                )}
                <DVirtualScroll
                  {...vsPerformance}
                  ref={vsRef}
                  dFillNode={<li></li>}
                  dItemRender={(item, index, { aria, vsList }, parent) => {
                    const { label: itemLabel, value: itemValue, disabled: itemDisabled, children } = item;

                    const node = dCustomItem ? dCustomItem(item) : itemLabel;

                    if (children) {
                      return (
                        <ul
                          key={itemValue}
                          className={`${dPrefix}select__option-group`}
                          role="group"
                          aria-labelledby={getGroupId(itemValue)}
                        >
                          <li
                            key={itemValue}
                            id={getGroupId(itemValue)}
                            className={`${dPrefix}select__option-group-label`}
                            role="presentation"
                          >
                            <div className={`${dPrefix}select__option-content`}>{node}</div>
                          </li>
                          {vsList}
                        </ul>
                      );
                    }

                    let isSelected = false;
                    if (dMultiple) {
                      isSelected = (select as Set<V>).has(itemValue);
                    } else {
                      isSelected = (select as V | null) === itemValue;
                    }

                    return (
                      <li
                        {...aria}
                        key={itemValue}
                        id={getItemId(itemValue)}
                        className={getClassName(`${dPrefix}select__option`, {
                          'is-selected': !dMultiple && isSelected,
                          'is-disabled': itemDisabled,
                        })}
                        style={{ paddingLeft: parent.length === 0 ? undefined : 12 + 8 }}
                        title={(item[IS_CREATE] ? t('Create') + ' ' : '') + itemLabel}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={itemDisabled}
                        onClick={() => {
                          if (!itemDisabled) {
                            if (item[IS_CREATE]) {
                              createItem(item);
                            }
                            changeFocusItem(item);
                            changeSelectByClick(itemValue);
                          }
                        }}
                      >
                        {focusVisible && focusItem?.value === itemValue && <div className={`${dPrefix}focus-outline`}></div>}
                        {item[IS_CREATE] ? (
                          <PlusOutlined dTheme="primary" />
                        ) : dMultiple ? (
                          <DCheckbox dDisabled={itemDisabled} dModel={isSelected}></DCheckbox>
                        ) : null}
                        <div className={`${dPrefix}select__option-content`}>{node}</div>
                      </li>
                    );
                  }}
                  dFocusItem={focusItem}
                  dSize={264}
                  dPadding={4}
                  dEmptyRender={() => (
                    <li className={`${dPrefix}select__empty`} style={{ paddingLeft: 12 + 8 }}>
                      <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                    </li>
                  )}
                  onScrollEnd={onScrollBottom}
                >
                  {({ render, vsList }) =>
                    render(
                      <ul
                        id={listId}
                        className={`${dPrefix}select__list`}
                        style={{ pointerEvents: dLoading ? 'none' : undefined }}
                        tabIndex={-1}
                        role="listbox"
                        aria-multiselectable={dMultiple}
                        aria-activedescendant={isUndefined(focusItem) ? undefined : getItemId(focusItem.value)}
                      >
                        {list.length === 0 ? (
                          <li className={`${dPrefix}select__empty`}>
                            <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
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
        </DTransition>
      )}
    </DSelectbox>
  );
}

export const DSelect: <V extends DId, T extends DSelectItem<V>>(
  props: DSelectProps<V, T> & React.RefAttributes<DSelectRef>
) => ReturnType<typeof Select> = React.forwardRef(Select) as any;
