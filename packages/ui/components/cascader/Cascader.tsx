import type { DId, DNestedChildren, DSize } from '../../utils';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { DDropdownItem } from '../dropdown';
import type { DFormControl } from '../form';
import type { DSelectItem } from '../select';
import type { AbstractTreeNode } from '../tree/node';

import { isNull } from 'lodash';
import React, { useCallback, useState, useId, useMemo, useRef } from 'react';

import { useEventNotify } from '@react-devui/hooks';
import { CloseOutlined, LoadingOutlined } from '@react-devui/icons';
import { findNested, getClassName, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue, useTranslation } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DComboboxKeyboardSupport } from '../_keyboard-support';
import { DSelectbox } from '../_selectbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { DTag } from '../tag';
import { DSearchPanel as DTreeSearchPanel } from '../tree/SearchPanel';
import { MultipleTreeNode, SingleTreeNode } from '../tree/node';
import { getText, TREE_NODE_KEY } from '../tree/utils';
import { DList } from './List';

export interface DCascaderRef {
  updatePosition: () => void;
}

export type DSearchItem<V extends DId, T> = DSelectItem<V> & { [TREE_NODE_KEY]: AbstractTreeNode<V, T> };

export interface DCascaderItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
}

export interface DCascaderProps<V extends DId, T extends DCascaderItem<V>> extends React.HTMLAttributes<HTMLDivElement> {
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
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCustomSearch?: {
    filter?: (value: string, item: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dPopupClassName?: string;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFirstFocus?: (value: V, item: DNestedChildren<T>) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCascader' });
function Cascader<V extends DId, T extends DCascaderItem<V>>(
  props: DCascaderProps<V, T>,
  ref: React.ForwardedRef<DCascaderRef>
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
    dOnlyLeafSelectable = true,
    dCustomItem,
    dCustomSelected,
    dCustomSearch,
    dPopupClassName,
    dInputProps,
    dInputRef,
    onModelChange,
    onVisibleChange,
    afterVisibleChange,
    onSearch,
    onClear,
    onFirstFocus,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const dataRef = useRef<{
    focusList: Set<V>;
  }>({
    focusList: new Set(),
  });

  const [t] = useTranslation();
  const onKeyDown$ = useEventNotify<DComboboxKeyboardSupportKey | 'click'>();

  const uniqueId = useId();
  const listId = `${dPrefix}cascader-list-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}cascader-item-${val}-${uniqueId}`;

  const renderNodes = useMemo(
    () =>
      dList.map((item) =>
        dMultiple
          ? new MultipleTreeNode(item, (origin) => origin.value, {
              disabled: item.disabled,
            })
          : new SingleTreeNode(item, (origin) => origin.value, {
              disabled: item.disabled,
            })
      ),
    [dMultiple, dList]
  );
  const nodesMap = useMemo(() => {
    const nodes = new Map<V, AbstractTreeNode<V, T>>();
    const reduceArr = (arr: AbstractTreeNode<V, T>[]) => {
      for (const item of arr) {
        nodes.set(item.id, item);
        if (item.children) {
          reduceArr(item.children);
        }
      }
    };
    reduceArr(renderNodes);
    return nodes;
  }, [renderNodes]);

  const [searchValue, setSearchValue] = useState('');

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
            (value as V[]).map((v) => nodesMap.get(v)?.origin)
          );
        } else {
          onModelChange(value, isNull(value) ? null : nodesMap.get(value as V)?.origin);
        }
      }
    },
    undefined,
    formControlInject
  );
  const select = useMemo(() => (dMultiple ? new Set(_select as V[]) : (_select as V | null)), [_select, dMultiple]);
  renderNodes.forEach((node) => {
    node.updateStatus(select);
  });

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

  const [focusVisible, setFocusVisible] = useState(false);

  const filterFn = useCallback(
    (item: T, searchStr = searchValue) => {
      const defaultFilterFn = (item: T) => {
        return item.label.includes(searchStr);
      };
      return dCustomSearch && dCustomSearch.filter ? dCustomSearch.filter(searchStr, item) : defaultFilterFn(item);
    },
    [dCustomSearch, searchValue]
  );
  const sortFn = dCustomSearch?.sort;
  const searchList = useMemo(() => {
    if (!hasSearch) {
      return [];
    }

    const searchList: DSearchItem<V, T>[] = [];
    const reduceNodes = (nodes: AbstractTreeNode<V, T>[]) => {
      nodes.forEach((node) => {
        if ((!dMultiple && !dOnlyLeafSelectable) || node.isLeaf) {
          if (filterFn(node.origin)) {
            searchList.push({
              label: getText(node),
              value: node.id,
              disabled: node.disabled,
              [TREE_NODE_KEY]: node,
            });
          }
        }
        if (node.children) {
          reduceNodes(node.children);
        }
      });
    };
    reduceNodes(renderNodes);

    if (sortFn) {
      searchList.sort((a, b) => sortFn(a[TREE_NODE_KEY].origin, b[TREE_NODE_KEY].origin));
    }
    return searchList;
  }, [dMultiple, dOnlyLeafSelectable, filterFn, hasSearch, renderNodes, sortFn]);

  const [_noSearchFocusItem, setNoSearchFocusItem] = useState<AbstractTreeNode<V, T> | undefined>();
  const noSearchFocusItem = (() => {
    if (_noSearchFocusItem) {
      const node = nodesMap.get(_noSearchFocusItem.id);
      if (node && node.enabled) {
        return node;
      }
    }

    if (hasSelected) {
      return findNested(renderNodes, (node) => node.enabled && node.checked);
    }
  })();

  const [_searchFocusItem, setSearchFocusItem] = useState<DSearchItem<V, T> | undefined>();
  const searchFocusItem = (() => {
    if (_searchFocusItem && findNested(searchList, (item) => item[TREE_NODE_KEY].enabled && item.value === _searchFocusItem.value)) {
      return _searchFocusItem;
    }

    if (hasSearch) {
      return findNested(searchList, (item) => item[TREE_NODE_KEY].enabled);
    }
  })();

  const handleClear = () => {
    onClear?.();

    if (dMultiple) {
      changeSelect([]);
    } else {
      changeSelect(null);
    }
  };

  const updatePosition = useCallback((boxEl: HTMLElement, popupEl: HTMLElement) => {
    const width = boxEl.getBoundingClientRect().width;
    const { height } = getOriginalSize(popupEl);
    const { top, left, transformOrigin } = getVerticalSidePosition(boxEl, { width, height }, 'bottom-left', 8);

    return {
      position: {
        top,
        left,
        maxWidth: window.innerWidth - left - 20,
      },
      transformOrigin,
    };
  }, []);

  const [selectedNode, suffixNode, selectedLabel] = (() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selectedNodes = (_select as V[]).map((v) => nodesMap.get(v) as MultipleTreeNode<V, T>);

      suffixNode = (
        <DDropdown
          dList={selectedNodes.map<DDropdownItem<V> & { node: MultipleTreeNode<V, T> }>((node) => {
            const { value: itemValue, disabled: itemDisabled } = node.origin;
            const text = dCustomSelected ? dCustomSelected(node.origin) : getText(node);

            return {
              id: itemValue,
              label: text,
              type: 'item',
              disabled: itemDisabled,
              node,
            };
          })}
          dCloseOnClick={false}
          onItemClick={(id, item) => {
            const checkeds = (item.node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as Set<V>);
            changeSelect(Array.from(checkeds.keys()));
          }}
        >
          <DTag className={`${dPrefix}cascader__multiple-count`} dSize={size}>
            {(select as Set<V>).size}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedNodes.map((node) => (
        <DTag key={node.id} className={`${dPrefix}cascader__multiple-tag`} dSize={size}>
          {dCustomSelected ? dCustomSelected(node.origin) : node.origin.label}
          {!(node.disabled || disabled) && (
            <div
              className={`${dPrefix}cascader__close`}
              role="button"
              aria-label={t('Close')}
              onClick={(e) => {
                e.stopPropagation();

                const checkeds = (node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as Set<V>);
                changeSelect(Array.from(checkeds.keys()));
              }}
            >
              <CloseOutlined />
            </div>
          )}
        </DTag>
      ));
    } else {
      if (!isNull(select)) {
        const node = nodesMap.get(select as V)!;
        selectedLabel = getText(node);
        selectedNode = dCustomSelected ? dCustomSelected(node.origin) : selectedLabel;
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  })();

  return (
    <DComboboxKeyboardSupport
      dVisible={visible}
      dEditable={dSearchable}
      dNested={!hasSearch}
      onVisibleChange={changeVisible}
      onFocusChange={(key) => {
        onKeyDown$.next(key);
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
          dClassNamePrefix="cascader"
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

              if ((e.code === 'Enter' || (!dSearchable && e.code === 'Space')) && visible) {
                onKeyDown$.next('click');
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
          dUpdatePosition={updatePosition}
          afterVisibleChange={afterVisibleChange}
          onFocusVisibleChange={setFocusVisible}
          onClear={handleClear}
        >
          {({ sPopupRef, sStyle, sOnMouseDown, sOnMouseUp }) => (
            <div
              ref={sPopupRef}
              className={getClassName(dPopupClassName, `${dPrefix}cascader__popup`)}
              style={sStyle}
              onMouseDown={sOnMouseDown}
              onMouseUp={sOnMouseUp}
            >
              {dLoading && (
                <div
                  className={getClassName(`${dPrefix}cascader__loading`, {
                    [`${dPrefix}cascader__loading--empty`]: (hasSearch ? searchList : renderNodes).length === 0,
                  })}
                >
                  <LoadingOutlined dSize={(hasSearch ? searchList : renderNodes).length === 0 ? 18 : 24} dSpin />
                </div>
              )}
              {hasSearch ? (
                <DTreeSearchPanel
                  id={listId}
                  style={{ pointerEvents: dLoading ? 'none' : undefined }}
                  dGetItemId={getItemId}
                  dList={searchList}
                  dFocusItem={searchFocusItem}
                  dCustomItem={dCustomItem}
                  dMultiple={dMultiple}
                  dOnlyLeafSelectable={dOnlyLeafSelectable}
                  dFocusVisible={focusVisible}
                  onFocusChange={(item) => {
                    if (!dataRef.current.focusList.has(item.value)) {
                      dataRef.current.focusList.add(item.value);
                      onFirstFocus?.(item.value, item[TREE_NODE_KEY].origin);
                    }

                    setSearchFocusItem(item);
                  }}
                  onClickItem={(item) => {
                    if (dMultiple) {
                      const checkeds = (item[TREE_NODE_KEY] as MultipleTreeNode<V, T>).changeStatus(
                        item[TREE_NODE_KEY].checked ? 'UNCHECKED' : 'CHECKED',
                        select as Set<V>
                      );
                      changeSelect(Array.from(checkeds.keys()));
                    } else {
                      changeSelect(item[TREE_NODE_KEY].id);
                      changeVisible(false);
                    }
                  }}
                  onKeyDown$={onKeyDown$}
                ></DTreeSearchPanel>
              ) : (
                <DList
                  id={listId}
                  style={{ pointerEvents: dLoading ? 'none' : undefined }}
                  dGetItemId={getItemId}
                  dList={renderNodes}
                  dFocusItem={noSearchFocusItem}
                  dCustomItem={dCustomItem}
                  dMultiple={dMultiple}
                  dFocusVisible={focusVisible}
                  dRoot
                  onFocusChange={(node) => {
                    if (!dataRef.current.focusList.has(node.id)) {
                      dataRef.current.focusList.add(node.id);
                      onFirstFocus?.(node.id, node.origin);
                    }

                    setNoSearchFocusItem(node);
                  }}
                  onClickItem={(node) => {
                    if (dMultiple) {
                      const checkeds = (node as MultipleTreeNode<V, T>).changeStatus(
                        node.checked ? 'UNCHECKED' : 'CHECKED',
                        select as Set<V>
                      );
                      changeSelect(Array.from(checkeds.keys()));
                    } else {
                      if (!dOnlyLeafSelectable || node.isLeaf) {
                        changeSelect(node.id);
                      }
                      if (node.isLeaf) {
                        changeVisible(false);
                      }
                    }
                  }}
                  onKeyDown$={onKeyDown$}
                ></DList>
              )}
            </div>
          )}
        </DSelectbox>
      )}
    </DComboboxKeyboardSupport>
  );
}

export const DCascader: <V extends DId, T extends DCascaderItem<V>>(
  props: DCascaderProps<V, T> & React.RefAttributes<DCascaderRef>
) => ReturnType<typeof Cascader> = React.forwardRef(Cascader) as any;
