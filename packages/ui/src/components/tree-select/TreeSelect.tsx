import type { DId, DSize } from '../../utils/types';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { DSearchItem } from '../cascader';
import type { DDropdownItem } from '../dropdown';
import type { DFormControl } from '../form';
import type { DTreeItem } from '../tree';
import type { AbstractTreeNode } from '../tree/abstract-node';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useState, useId, useMemo, useRef } from 'react';

import { useEventNotify } from '@react-devui/hooks';
import { CloseOutlined, LoadingOutlined } from '@react-devui/icons';
import { findNested, getClassName, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';
import { POSITION_CONFIG } from '@react-devui/utils/position/config';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue, useTranslation } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DComboboxKeyboardSupport } from '../_keyboard-support';
import { DSelectbox } from '../_selectbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { DTag } from '../tag';
import { DPanel as DTreePanel } from '../tree/Panel';
import { DSearchPanel as DTreeSearchPanel } from '../tree/SearchPanel';
import { MultipleTreeNode } from '../tree/multiple-node';
import { SingleTreeNode } from '../tree/single-node';
import { getText, TREE_NODE_KEY } from '../tree/utils';

export interface DTreeSelectRef {
  updatePosition: () => void;
}

export interface DTreeSelectProps<V extends DId, T extends DTreeItem<V>> extends React.HTMLAttributes<HTMLDivElement> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dExpands?: V[];
  dExpandAll?: boolean;
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dClearable?: boolean;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  dCustomSelected?: (select: T) => string;
  dCustomSearch?: {
    filter?: (value: string, item: T) => boolean;
    sort?: (a: T, b: T) => number;
  };
  dPopupClassName?: string;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTreeSelect' as const });
function TreeSelect<V extends DId, T extends DTreeItem<V>>(
  props: DTreeSelectProps<V, T>,
  ref: React.ForwardedRef<DTreeSelectRef>
): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dExpands,
    dExpandAll = false,
    dVisible,
    dPlaceholder,
    dSize,
    dLoading = false,
    dSearchable = false,
    dClearable = false,
    dShowLine = false,
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
    onFirstExpand,
    onExpandsChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const dataRef = useRef<{
    hasExpandList: Set<V>;
  }>({
    hasExpandList: new Set(dExpands),
  });

  const [eventId, onKeyDown$] = useEventNotify<[DComboboxKeyboardSupportKey | 'click']>();
  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}tree-select-list-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}tree-group-${val}-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}tree-item-${val}-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);

  const renderNodes = useMemo<AbstractTreeNode<V, T>[]>(
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
  const [nodesMap, initExpandAll] = useMemo(() => {
    const nodes = new Map<V, AbstractTreeNode<V, T>>();
    const expandAllNodes: V[] = [];
    const reduceArr = (arr: AbstractTreeNode<V, T>[]) => {
      for (const item of arr) {
        nodes.set(item.id, item);
        if (item.children) {
          expandAllNodes.push(item.id);
          reduceArr(item.children);
        }
      }
    };
    reduceArr(renderNodes);
    return [nodes, expandAllNodes];
  }, [renderNodes]);

  const formControlInject = useFormControl(dFormControl);
  const [_select, changeSelect] = useDValue<V | null | V[]>(
    dMultiple ? [] : null,
    dModel,
    (value) => {
      if (onModelChange) {
        if (dMultiple) {
          onModelChange(
            value,
            (value as V[]).map((v) => nodesMap.get(v)!.origin)
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

  const [_expandIds, changeExpandIds] = useDValue<V[]>(dExpandAll ? initExpandAll : [], dExpands, (value) => {
    if (onExpandsChange) {
      onExpandsChange(
        value,
        value.map((v) => nodesMap.get(v)!.origin)
      );
    }
  });
  const expandIds = useMemo(() => new Set(_expandIds), [_expandIds]);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

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

  const [focusVisible, setFocusVisible] = useState(false);

  const [_noSearchFocusItem, setNoSearchFocusItem] = useState<AbstractTreeNode<V, T> | undefined>();
  const noSearchFocusItem = (() => {
    let focusItem: AbstractTreeNode<V, T> | undefined;

    if (_noSearchFocusItem) {
      focusItem = nodesMap.get(_noSearchFocusItem.id);
      if (focusItem && focusItem.enabled) {
        return focusItem;
      }
    }

    if (hasSelected) {
      focusItem = findNested(
        renderNodes,
        (node) => node.enabled && node.checked,
        (node) => expandIds.has(node.id) && node.children
      );
    }

    if (isUndefined(focusItem)) {
      focusItem = findNested(
        renderNodes,
        (node) => node.enabled,
        (node) => expandIds.has(node.id) && node.children
      );
    }

    return focusItem;
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
          <DTag className={`${dPrefix}tree-select__multiple-count`} dSize={size}>
            {(select as Set<V>).size}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedNodes.map((node) => (
        <DTag key={node.id} className={`${dPrefix}tree-select__multiple-tag`} dSize={size}>
          {dCustomSelected ? dCustomSelected(node.origin) : node.origin.label}
          {!(node.disabled || disabled) && (
            <div
              className={`${dPrefix}tree-select__close`}
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
      onFocusChange={onKeyDown$}
    >
      {({ ksOnKeyDown }) => (
        <DSelectbox
          {...restProps}
          ref={ref}
          onClick={(e) => {
            restProps.onClick?.(e);

            changeVisible((draft) => (dSearchable ? true : !draft));
          }}
          dClassNamePrefix="tree-select"
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
                onKeyDown$('click');
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
            const boxWidth = boxEl.getBoundingClientRect().width;
            const { height } = getOriginalSize(popupEl);
            const maxWidth = window.innerWidth - POSITION_CONFIG.space * 2;
            const width = Math.min(Math.max(popupEl.scrollWidth, boxWidth), maxWidth);
            const { top, left, transformOrigin } = getVerticalSidePosition(
              boxEl,
              { width, height },
              {
                placement: 'bottom-left',
                inWindow: true,
              }
            );

            return {
              position: {
                top,
                left,
                minWidth: Math.min(boxWidth, maxWidth),
                maxWidth,
              },
              transformOrigin,
            };
          }}
          afterVisibleChange={afterVisibleChange}
          onFocusVisibleChange={setFocusVisible}
          onClear={handleClear}
        >
          {({ sPopupRef, sStyle, sOnMouseDown, sOnMouseUp }) => (
            <div
              ref={sPopupRef}
              className={getClassName(dPopupClassName, `${dPrefix}tree-select__popup`)}
              style={sStyle}
              onMouseDown={sOnMouseDown}
              onMouseUp={sOnMouseUp}
            >
              {dLoading && (
                <div
                  className={getClassName(`${dPrefix}tree-select__loading`, {
                    [`${dPrefix}tree-select__loading--empty`]: (hasSearch ? searchList : renderNodes).length === 0,
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
                  dEventId={eventId}
                  onFocusChange={setSearchFocusItem}
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
                ></DTreeSearchPanel>
              ) : (
                <DTreePanel
                  id={listId}
                  style={{ pointerEvents: dLoading ? 'none' : undefined }}
                  dGetGroupId={getGroupId}
                  dGetItemId={getItemId}
                  dList={renderNodes}
                  dExpandIds={expandIds}
                  dHeight={264}
                  dPadding={4}
                  dFocusItem={noSearchFocusItem}
                  dCustomItem={dCustomItem}
                  dShowLine={dShowLine}
                  dMultiple={dMultiple}
                  dFocusVisible={focusVisible}
                  dEventId={eventId}
                  onFocusChange={setNoSearchFocusItem}
                  onExpandChange={(item) => {
                    const isExpand = expandIds.has(item.id);

                    if (!item.origin.loading) {
                      if (isExpand) {
                        changeExpandIds((draft) => {
                          draft.splice(
                            draft.findIndex((id) => id === item.id),
                            1
                          );
                        });
                      } else {
                        if (!dataRef.current.hasExpandList.has(item.id)) {
                          dataRef.current.hasExpandList.add(item.id);
                          onFirstExpand?.(item.id, item.origin);
                        }
                        changeExpandIds((draft) => {
                          draft.push(item.id);
                        });
                      }
                    }
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
                    }
                  }}
                ></DTreePanel>
              )}
            </div>
          )}
        </DSelectbox>
      )}
    </DComboboxKeyboardSupport>
  );
}

export const DTreeSelect: <V extends DId, T extends DTreeItem<V>>(
  props: DTreeSelectProps<V, T> & React.RefAttributes<DTreeSelectRef>
) => ReturnType<typeof TreeSelect> = React.forwardRef(TreeSelect) as any;
