import type { DNestedChildren, DId, DSize } from '../../utils/global';
import type { DDropdownItem } from '../dropdown';
import type { DFormControl } from '../form';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';

import { isNull, isUndefined } from 'lodash';
import React, { useState, useId, useCallback, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralContext, useEventCallback, useDValue } from '../../hooks';
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DComboboxKeyboardSupport } from '../_keyboard-support';
import { DSelectbox } from '../_selectbox';
import { DCheckbox } from '../checkbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
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
}

export interface DSelectProps<V extends DId, T extends DSelectItem<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: DNestedChildren<T>[];
  dModel?: V | null | V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dClearable?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dCustomItem?: (item: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCustomSearch?: {
    filter?: (value: string, item: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dCreateItem?: (value: string) => DNestedChildren<T> | undefined;
  dPopupClassName?: string;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onCreateItem?: (item: DNestedChildren<T>) => void;
  onScrollBottom?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSelect' });
function Select<V extends DId, T extends DSelectItem<V>>(
  props: DSelectProps<V, T>,
  ref: React.ForwardedRef<DSelectRef>
): JSX.Element | null {
  const {
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
    dInputProps,
    dInputRef,
    onModelChange,
    onVisibleChange,
    afterVisibleChange,
    onClear,
    onSearch,
    onCreateItem,
    onScrollBottom,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}select-list-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}select-group-${val}-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}select-item-${val}-${uniqueId}`;

  const itemsMap = useMemo(() => {
    const items = new Map<V, T>();
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (const item of arr) {
        items.set(item.value, item);
        if (item.children) {
          reduceArr(item.children);
        }
      }
    };
    reduceArr(dList);
    return items;
  }, [dList]);

  const [searchValue, setSearchValue] = useState('');

  const canSelectItem = useCallback((item: DNestedChildren<T>) => !item.disabled && !item.children, []);

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
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

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
        item.children.forEach((groupItem) => {
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

  const [_noSearchFocusItem, setNoSearchFocusItem] = useState<DNestedChildren<T> | undefined>();
  const noSearchFocusItem = (() => {
    let focusItem: DNestedChildren<T> | undefined;

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
  const changeFocusItem = (item?: DNestedChildren<T>) => {
    if (!isUndefined(item)) {
      hasSearch ? setSearchFocusItem(item) : setNoSearchFocusItem(item);
    }
  };

  const createItem = (item?: DNestedChildren<T>) => {
    if (!isUndefined(item)) {
      const newItem = { ...item };
      delete newItem[IS_CREATE];
      onCreateItem?.(newItem);
    }
  };

  const changeSelectByClick = useEventCallback((val: V) => {
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
  });

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

  const vsPerformance = useMemo<DVirtualScrollPerformance<DNestedChildren<T>>>(
    () => ({
      dList: list,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children,
        emptySize: 32,
        asItem: false,
      }),
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, list]
  );

  return (
    <DComboboxKeyboardSupport
      dVisible={visible}
      dEditable={dSearchable}
      onVisibleChange={changeVisible}
      onFocusChange={(focus) => {
        switch (focus) {
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
      {({ ksOnKeyDown }) => (
        <DSelectbox
          {...restProps}
          ref={ref}
          onClick={(e) => {
            restProps.onClick?.(e);

            changeVisible((draft) => (dSearchable ? true : !draft));
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
          dInputProps={{
            ...dInputProps,
            value: searchValue,
            'aria-controls': listId,
            onBlur: (e) => {
              dInputProps?.onBlur?.(e);

              changeVisible(false);
            },
            onKeyDown: (e) => {
              dInputProps?.onKeyDown?.(e);
              ksOnKeyDown(e);

              if ((e.code === 'Enter' || (!dSearchable && e.code === 'Space')) && visible && focusItem) {
                e.preventDefault();
                if (focusItem[IS_CREATE]) {
                  createItem(focusItem);
                }
                changeSelectByClick(focusItem.value);
              }
            },
            onChange: (e) => {
              dInputProps?.onChange?.(e);

              const val = e.currentTarget.value;
              if (dSearchable) {
                setSearchValue(val);
                onSearch?.(val);
              }
            },
          }}
          dInputRef={dInputRef}
          dUpdatePosition={(boxEl, popupEl) => {
            const width = boxEl.getBoundingClientRect().width;
            const { height } = getNoTransformSize(popupEl);
            const { top, left, transformOrigin } = getVerticalSidePosition(boxEl, { width, height }, 'bottom-left', 8);

            return {
              position: {
                top,
                left,
                width,
                maxWidth: window.innerWidth - left - 20,
              },
              transformOrigin,
            };
          }}
          afterVisibleChange={afterVisibleChange}
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
          {({ sPopupRef, sStyle, sOnMouseDown, sOnMouseUp }) => (
            <div
              ref={sPopupRef}
              className={getClassName(dPopupClassName, `${dPrefix}select__popup`)}
              style={sStyle}
              onMouseDown={sOnMouseDown}
              onMouseUp={sOnMouseUp}
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
                ref={dVSRef}
                id={listId}
                className={`${dPrefix}select__list`}
                role="listbox"
                aria-multiselectable={dMultiple}
                aria-activedescendant={isUndefined(focusItem) ? undefined : getItemId(focusItem.value)}
                dItemRender={(item, index, { iARIA, iChildren }, parent) => {
                  const { label: itemLabel, value: itemValue, disabled: itemDisabled, children } = item;

                  const node = dCustomItem ? dCustomItem(item) : itemLabel;

                  if (children) {
                    return (
                      <ul key={itemValue} className={`${dPrefix}select__option-group`} role="group" aria-labelledby={getGroupId(itemValue)}>
                        <li
                          key={itemValue}
                          id={getGroupId(itemValue)}
                          className={`${dPrefix}select__option-group-label`}
                          role="presentation"
                        >
                          <div className={`${dPrefix}select__option-content`}>{node}</div>
                        </li>
                        {iChildren}
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
                      {...iARIA}
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
                dEmptyRender={(item) => (
                  <li className={`${dPrefix}select__empty`} style={{ paddingLeft: item ? 12 + 8 : undefined }}>
                    <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                  </li>
                )}
                onScrollEnd={onScrollBottom}
              />
            </div>
          )}
        </DSelectbox>
      )}
    </DComboboxKeyboardSupport>
  );
}

export const DSelect: <V extends DId, T extends DSelectItem<V>>(
  props: DSelectProps<V, T> & { ref?: React.ForwardedRef<DSelectRef> }
) => ReturnType<typeof Select> = React.forwardRef(Select) as any;
