import type { DCloneHTMLElement, DId, DSize } from '../../utils/types';
import type { ComboboxKeyDownRef } from '../_keyboard';
import type { DSearchItem } from '../cascader';
import type { DDropdownItem } from '../dropdown';
import type { DFormControl } from '../form';
import type { DTreeItem } from '../tree';
import type { AbstractTreeNode } from '../tree/abstract-node';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useState, useMemo, useRef, useImperativeHandle } from 'react';

import { useEventCallback, useId } from '@react-devui/hooks';
import { CloseOutlined, LoadingOutlined } from '@react-devui/icons';
import { findNested, getClassName, getVerticalSidePosition } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { cloneHTMLElement, registerComponentMate, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DComboboxKeyboard } from '../_keyboard';
import { DSelectbox } from '../_selectbox';
import { DTransition } from '../_transition';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
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
  dRef?: {
    input?: React.ForwardedRef<HTMLInputElement>;
  };
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dExpands?: V[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dSearchValue?: string;
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
  dInputRender?: DCloneHTMLElement<React.InputHTMLAttributes<HTMLInputElement>>;
  onModelChange?: (value: any, item: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  onSearchValueChange?: (value: string) => void;
  onClear?: () => void;
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTreeSelect' as const });
function TreeSelect<V extends DId, T extends DTreeItem<V>>(
  props: DTreeSelectProps<V, T>,
  ref: React.ForwardedRef<DTreeSelectRef>
): JSX.Element | null {
  const {
    dRef,
    dFormControl,
    dList,
    dModel,
    dExpands,
    dVisible,
    dPlaceholder,
    dSize,
    dLoading = false,
    dSearchable = false,
    dSearchValue,
    dClearable = false,
    dShowLine = false,
    dDisabled = false,
    dMultiple = false,
    dOnlyLeafSelectable = true,
    dCustomItem,
    dCustomSelected,
    dCustomSearch,
    dPopupClassName,
    dInputRender,
    onModelChange,
    onVisibleChange,
    onSearchValueChange,
    onClear,
    onFirstExpand,
    onExpandsChange,
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
  const comboboxKeyDownRef = useRef<ComboboxKeyDownRef>(null);
  //#endregion

  const dataRef = useRef<{
    hasExpandList: Set<V>;
  }>({
    hasExpandList: new Set(dExpands),
  });

  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}tree-select-list-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}tree-group-${val}-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}tree-item-${val}-${uniqueId}`;

  const [searchValue, changeSearchValue] = useDValue<string>('', dSearchValue, onSearchValueChange);

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

  const [_expandIds, changeExpandIds] = useDValue<V[]>([], dExpands, (value) => {
    if (onExpandsChange) {
      onExpandsChange(
        value,
        value.map((v) => nodesMap.get(v)!.origin)
      );
    }
  });
  const expandIds = useMemo(() => new Set(_expandIds), [_expandIds]);

  const size = dSize ?? gSize;
  const disabled = (dDisabled || gDisabled || dFormControl?.control.disabled) ?? false;

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
          <DTag className={`${dPrefix}tree-select__multiple-count`} tabIndex={-1} dSize={size}>
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
      dUpdatePosition={{
        fn: updatePosition,
        popupRef,
        extraScrollRefs: [],
      }}
      dInputRender={(el) => (
        <DComboboxKeyboard
          dVisible={visible}
          dEditable={dSearchable}
          dHasSub={!hasSearch}
          onVisibleChange={changeVisible}
          onFocusChange={(key) => {
            comboboxKeyDownRef.current?.(key);
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

                  if ((e.code === 'Enter' || (!dSearchable && e.code === 'Space')) && visible) {
                    comboboxKeyDownRef.current?.('click');
                  }
                },
                onChange: (e) => {
                  el.props.onChange?.(e);

                  const val = e.currentTarget.value;
                  if (dSearchable) {
                    changeSearchValue(val);
                  }
                },
              })
            );

            return isUndefined(dInputRender) ? input : dInputRender(input);
          }}
        </DComboboxKeyboard>
      )}
      onFocusVisibleChange={setFocusVisible}
      onClear={handleClear}
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
                className={getClassName(dPopupClassName, `${dPrefix}tree-select__popup`)}
                style={{
                  ...popupPositionStyle,
                  ...transitionStyle,
                }}
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
                    ref={comboboxKeyDownRef}
                    id={listId}
                    style={{ pointerEvents: dLoading ? 'none' : undefined }}
                    dGetItemId={getItemId}
                    dList={searchList}
                    dFocusItem={searchFocusItem}
                    dCustomItem={dCustomItem}
                    dMultiple={dMultiple}
                    dOnlyLeafSelectable={dOnlyLeafSelectable}
                    dFocusVisible={focusVisible}
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
                    ref={comboboxKeyDownRef}
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
            );
          }}
        </DTransition>
      )}
    </DSelectbox>
  );
}

export const DTreeSelect: <V extends DId, T extends DTreeItem<V>>(
  props: DTreeSelectProps<V, T> & React.RefAttributes<DTreeSelectRef>
) => ReturnType<typeof TreeSelect> = React.forwardRef(TreeSelect) as any;
