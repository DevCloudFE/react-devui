import type { DId } from '../../utils';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';

import { useForceUpdate } from '@react-devui/hooks';
import { FilterFilled, LoadingOutlined, SearchOutlined } from '@react-devui/icons';
import { findNested, getClassName, isSimpleArrayEqual } from '@react-devui/utils';

import { useComponentConfig, useDValue, usePrefixConfig, useTranslation } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DButton } from '../button';
import { DCheckbox } from '../checkbox';
import { DInput } from '../input';
import { DPopover } from '../popover';
import { DRadio } from '../radio';
import { DVirtualScroll } from '../virtual-scroll';

export interface DTableFilterRef {
  updatePosition: () => void;
}

export interface DTableFilterItem<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTable.Filter' });
export interface DTableFilterProps<V extends DId, T extends DTableFilterItem<V>> extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dList: T[];
  dSelected?: V | null | V[];
  dVisible?: boolean;
  dLoading?: boolean;
  dSearchable?: boolean;
  dMultiple?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dPopupClassName?: string;
  onSelectedChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onScrollBottom?: () => void;
}

function TableFilter<V extends DId, T extends DTableFilterItem<V>>(
  props: DTableFilterProps<V, T>,
  ref: React.ForwardedRef<DTableFilterRef>
): JSX.Element | null {
  const {
    dList,
    dSelected,
    dVisible,
    dLoading = false,
    dSearchable = false,
    dMultiple = false,
    dCustomItem,
    dCustomSearch,
    dPopupClassName,
    onSelectedChange,
    onVisibleChange,
    afterVisibleChange,
    onSearch,
    onScrollBottom,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const dataRef = useRef<{
    showSelected: V | null | V[];
    prevSelected: V | null | V[];
  }>({ showSelected: dMultiple ? [] : null, prevSelected: dMultiple ? [] : null });

  const [t] = useTranslation();
  const forceUpdate = useForceUpdate();

  const uniqueId = useId();
  const listId = `${dPrefix}table-filter-list-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}table-filter-item-${val}-${uniqueId}`;

  const itemsMap = useMemo(() => {
    const items = new Map<V, T>();
    const reduceArr = (arr: T[]) => {
      for (const item of arr) {
        items.set(item.value, item);
      }
    };
    reduceArr(dList);
    return items;
  }, [dList]);

  const [searchValue, setSearchValue] = useState('');

  const canSelectItem = useCallback((item: T) => !item.disabled, []);

  const [_select, changeSelect] = useDValue<V | null | V[]>(
    dMultiple ? [] : null,
    dSelected,
    (value) => {
      if (onSelectedChange) {
        if (dMultiple) {
          onSelectedChange(
            value,
            (value as V[]).map((v) => itemsMap.get(v))
          );
        } else {
          onSelectedChange(value, isNull(value) ? null : itemsMap.get(value as V));
        }
      }
    },
    dMultiple ? (isSimpleArrayEqual as any) : undefined
  );
  if (_select !== dataRef.current.prevSelected) {
    dataRef.current.showSelected = dataRef.current.prevSelected = _select;
  }
  const select = useMemo(
    () => (dMultiple ? new Set(dataRef.current.showSelected as V[]) : (dataRef.current.showSelected as V | null)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataRef.current.showSelected, dMultiple]
  );

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

  const _filterFn = dCustomSearch?.filter;
  const filterFn = useCallback(
    (item: T) => {
      const defaultTableFilterFn = (item: T) => {
        return item.label.includes(searchValue);
      };
      return _filterFn ? _filterFn(searchValue, item) : defaultTableFilterFn(item);
    },
    [_filterFn, searchValue]
  );
  const sortFn = dCustomSearch?.sort;
  const searchList = useMemo(() => {
    if (!hasSearch) {
      return [];
    }

    const searchList: T[] = [];
    dList.forEach((item) => {
      if (filterFn(item)) {
        searchList.push(item);
      }
    });

    if (sortFn) {
      searchList.sort(sortFn);
    }

    return searchList;
  }, [dList, filterFn, hasSearch, sortFn]);
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

  const [_searchFocusItem, setSearchFocusItem] = useState<T | undefined>();
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

  const changeSelectByClick = (val: V) => {
    if (dMultiple) {
      const arr = ([] as V[]).concat(dataRef.current.showSelected as V[]);
      const index = arr.findIndex((v) => v === val);
      if (index !== -1) {
        arr.splice(index, 1);
      } else {
        arr.push(val);
      }
      dataRef.current.showSelected = arr;
    } else {
      dataRef.current.showSelected = val;
    }
    forceUpdate();
  };

  const vsPerformance = useMemo<DVirtualScrollPerformance<T>>(
    () => ({
      dList: list,
      dItemSize: 32,
      dItemKey: (item) => item.value,
      dFocusable: canSelectItem,
    }),
    [canSelectItem, list]
  );

  return (
    <DPopover
      ref={ref}
      className={getClassName(dPopupClassName, `${dPrefix}table__filter-popup`)}
      onClick={(e) => {
        e.stopPropagation();
      }}
      dVisible={dVisible}
      dTrigger="click"
      dPlacement="bottom-right"
      dArrow={false}
      dContent={
        <>
          {dSearchable && (
            <DInput
              className={`${dPrefix}table__filter-search`}
              dPrefix={<SearchOutlined />}
              dPlaceholder={t('Search')}
              onModelChange={(val) => {
                setSearchValue(val);
                onSearch?.(val);
              }}
            ></DInput>
          )}
          {dLoading && (
            <div
              className={getClassName(`${dPrefix}table__filter-loading`, {
                [`${dPrefix}table__filter-loading--empty`]: list.length === 0,
              })}
            >
              <LoadingOutlined dSize={list.length === 0 ? 18 : 24} dSpin />
            </div>
          )}
          <DVirtualScroll
            {...vsPerformance}
            ref={dVSRef}
            dFillNode={<li></li>}
            dItemRender={(item, index, { iARIA }) => {
              const { label: itemLabel, value: itemValue, disabled: itemDisabled } = item;

              const node = dCustomItem ? dCustomItem(item) : itemLabel;

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
                  className={getClassName(`${dPrefix}table__filter-option`, {
                    'is-disabled': itemDisabled,
                  })}
                  title={itemLabel}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={itemDisabled}
                  onClick={() => {
                    if (!itemDisabled) {
                      changeFocusItem(item);
                      changeSelectByClick(itemValue);
                    }
                  }}
                >
                  {React.createElement(dMultiple ? DCheckbox : DRadio, { dModel: isSelected, dDisabled: itemDisabled })}
                  <div className={`${dPrefix}table__filter-option-content`}>{node}</div>
                </li>
              );
            }}
            dFocusItem={focusItem}
            dSize={200}
            dPadding={4}
            onScrollEnd={onScrollBottom}
          >
            {({ vsScrollRef, vsRender, vsOnScroll }) => (
              <ul
                ref={vsScrollRef}
                id={listId}
                className={`${dPrefix}table__filter-list`}
                style={{ pointerEvents: dLoading ? 'none' : undefined }}
                tabIndex={-1}
                role="listbox"
                aria-multiselectable={dMultiple}
                aria-activedescendant={isUndefined(focusItem) ? undefined : getItemId(focusItem.value)}
                onScroll={vsOnScroll}
              >
                {list.length === 0 ? (
                  <li className={`${dPrefix}table__filter-empty`}>
                    <div className={`${dPrefix}table__filter-option-content`}>{t('No Data')}</div>
                  </li>
                ) : (
                  vsRender
                )}
              </ul>
            )}
          </DVirtualScroll>
        </>
      }
      dFooter={
        <DPopover.Footer
          dActions={[
            <DButton
              key="$$reset"
              onClick={() => {
                dataRef.current.showSelected = dMultiple ? [] : null;
                forceUpdate();
              }}
              dType="link"
            >
              {t('Table', 'Reset')}
            </DButton>,
            'ok',
          ]}
        ></DPopover.Footer>
      }
      onVisibleChange={(visible) => {
        onVisibleChange?.(visible);

        if (!visible) {
          changeSelect(dataRef.current.showSelected);
        }
      }}
      afterVisibleChange={afterVisibleChange}
    >
      <button
        {...restProps}
        className={getClassName(restProps.className, {
          'is-active': hasSelected,
        })}
      >
        <FilterFilled dSize={12} />
      </button>
    </DPopover>
  );
}

export const DTableFilter: <V extends DId, T extends DTableFilterItem<V>>(
  props: DTableFilterProps<V, T> & React.RefAttributes<DTableFilterRef>
) => ReturnType<typeof TableFilter> = React.forwardRef(TableFilter) as any;
