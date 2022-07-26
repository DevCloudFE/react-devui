import type { DId, DNestedChildren, DSize } from '../../utils/global';
import type { DDropdownOption } from '../dropdown';
import type { DFormControl } from '../form';
import type { DSelectOption } from '../select';
import type { AbstractTreeNode } from '../tree';

import { isNull } from 'lodash';
import React, { useCallback, useState, useId, useMemo } from 'react';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue, useEventNotify } from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DSelectbox } from '../_selectbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { DTag } from '../tag';
import { MultipleTreeNode, SingleTreeNode } from '../tree';
import { DList } from './List';
import { DSearchList } from './SearchList';
import { getText, TREE_NODE_KEY } from './utils';

export interface DCascaderRef {
  updatePosition: () => void;
}

export type DSearchOption<V extends DId, T> = DSelectOption<V> & { [TREE_NODE_KEY]: AbstractTreeNode<V, T> };

export interface DCascaderOption<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
}

export interface DCascaderProps<V extends DId, T extends DCascaderOption<V>> extends React.HTMLAttributes<HTMLDivElement> {
  dFormControl?: DFormControl;
  dModel?: V | null | V[];
  dOptions: DNestedChildren<T>[];
  dVisible?: boolean;
  dPlaceholder?: string;
  dSize?: DSize;
  dLoading?: boolean;
  dSearchable?: boolean;
  dClearable?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomOption?: (option: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCustomSearch?: {
    filter?: (value: string, option: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dPopupClassName?: string;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: any, option: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onFocusChange?: (value: V, option: DNestedChildren<T>) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCascader' });
function Cascader<V extends DId, T extends DCascaderOption<V>>(
  props: DCascaderProps<V, T>,
  ref: React.ForwardedRef<DCascaderRef>
): JSX.Element | null {
  const {
    dFormControl,
    dModel,
    dOptions,
    dVisible,
    dPlaceholder,
    dSize,
    dLoading = false,
    dSearchable = false,
    dClearable = false,
    dDisabled = false,
    dMultiple = false,
    dOnlyLeafSelectable = true,
    dCustomOption,
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
    onFocusChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  const onKeyDown$ = useEventNotify<React.KeyboardEvent<HTMLInputElement>>();

  const uniqueId = useId();
  const listId = `${dPrefix}cascader-list-${uniqueId}`;
  const getOptionId = (val: V) => `${dPrefix}cascader-option-${val}-${uniqueId}`;

  const renderNodes = useMemo(
    () =>
      dOptions.map((option) =>
        dMultiple
          ? new MultipleTreeNode(option, (o) => o.value, {
              disabled: option.disabled,
            })
          : new SingleTreeNode(option, (o) => o.value, {
              disabled: option.disabled,
            })
      ),
    [dMultiple, dOptions]
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
    (option: T, searchStr = searchValue) => {
      const defaultFilterFn = (option: T) => {
        return option.label.includes(searchStr);
      };
      return dCustomSearch && dCustomSearch.filter ? dCustomSearch.filter(searchStr, option) : defaultFilterFn(option);
    },
    [dCustomSearch, searchValue]
  );
  const sortFn = dCustomSearch?.sort;
  const searchOptions = (() => {
    if (!hasSearch) {
      return [];
    }

    const searchOptions: DSearchOption<V, T>[] = [];
    const reduceNodes = (nodes: AbstractTreeNode<V, T>[]) => {
      nodes.forEach((node) => {
        if ((!dMultiple && !dOnlyLeafSelectable) || node.isLeaf) {
          if (filterFn(node.origin)) {
            searchOptions.push({
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
      searchOptions.sort((a, b) => sortFn(a[TREE_NODE_KEY].origin, b[TREE_NODE_KEY].origin));
    }
    return searchOptions;
  })();

  const [_noSearchFocusNode, setNoSearchFocusNode] = useState<AbstractTreeNode<V, T> | undefined>();
  const noSearchFocusNode = (() => {
    if (_noSearchFocusNode) {
      const node = nodesMap.get(_noSearchFocusNode.id);
      if (node && node.enabled) {
        return node;
      }
    }

    if (hasSelected) {
      return findNested(renderNodes as AbstractTreeNode<V, T>[], (node) => node.enabled && node.checked);
    }
  })();

  const [_searchFocusOption, setSearchFocusOption] = useState<DSearchOption<V, T> | undefined>();
  const searchFocusOption = (() => {
    if (_searchFocusOption && findNested(searchOptions, (o) => o[TREE_NODE_KEY].enabled && o.value === _searchFocusOption.value)) {
      return _searchFocusOption;
    }

    if (hasSearch) {
      return findNested(searchOptions, (o) => o[TREE_NODE_KEY].enabled);
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
          dOptions={selectedNodes.map<DDropdownOption<V> & { node: MultipleTreeNode<V, T> }>((node) => {
            const { value: optionValue, disabled: optionDisabled } = node.origin;
            const text = dCustomSelected ? dCustomSelected(node.origin) : getText(node);

            return {
              id: optionValue,
              label: text,
              type: 'item',
              disabled: optionDisabled,
              node,
            };
          })}
          dCloseOnClick={false}
          onOptionClick={(id, option) => {
            const checkeds = (option.node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as Set<V>);
            changeSelect(Array.from(checkeds.keys()));
          }}
        >
          <DTag className={`${dPrefix}cascader__multiple-count`} dSize={size}>
            {(select as Set<V>).size}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedNodes.map((node) => (
        <DTag
          key={node.id}
          className={`${dPrefix}cascader__multiple-tag`}
          dSize={size}
          dClosable={!(node.disabled || disabled)}
          onClose={(e) => {
            e.stopPropagation();

            const checkeds = (node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as Set<V>);
            changeSelect(Array.from(checkeds.keys()));
          }}
        >
          {dCustomSelected ? dCustomSelected(node.origin) : node.origin.label}
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
      ref={ref}
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
        onKeyDown: (e) => {
          dInputProps?.onKeyDown?.(e);

          if (visible) {
            onKeyDown$.next(e);
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
            maxWidth: window.innerWidth - left - 20,
          },
          transformOrigin,
        };
      }}
      onVisibleChange={changeVisible}
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
                [`${dPrefix}cascader__loading--empty`]: (hasSearch ? searchOptions : renderNodes).length === 0,
              })}
            >
              <LoadingOutlined dSize={(hasSearch ? searchOptions : renderNodes).length === 0 ? 18 : 24} dSpin />
            </div>
          )}
          {hasSearch ? (
            <DSearchList
              dListId={listId}
              dGetOptionId={getOptionId}
              dOptions={searchOptions}
              dSelected={select}
              dFocusOption={searchFocusOption}
              dCustomOption={dCustomOption}
              dMultiple={dMultiple}
              dOnlyLeafSelectable={dOnlyLeafSelectable}
              dFocusVisible={focusVisible}
              onSelectedChange={changeSelect}
              onClose={() => {
                changeVisible(false);
              }}
              onFocusChange={(option) => {
                onFocusChange?.(option.value, option[TREE_NODE_KEY].origin);

                setSearchFocusOption(option);
              }}
              onKeyDown$={onKeyDown$}
            ></DSearchList>
          ) : (
            <DList
              dListId={listId}
              dGetOptionId={getOptionId}
              dNodes={renderNodes}
              dSelected={select}
              dFocusNode={noSearchFocusNode}
              dCustomOption={dCustomOption}
              dMultiple={dMultiple}
              dOnlyLeafSelectable={dOnlyLeafSelectable}
              dFocusVisible={focusVisible}
              dRoot
              onSelectedChange={changeSelect}
              onClose={() => {
                changeVisible(false);
              }}
              onFocusChange={(node) => {
                onFocusChange?.(node.id, node.origin);

                setNoSearchFocusNode(node);
              }}
              onKeyDown$={onKeyDown$}
            ></DList>
          )}
        </div>
      )}
    </DSelectbox>
  );
}

export const DCascader: <V extends DId, T extends DCascaderOption<V>>(
  props: DCascaderProps<V, T> & { ref?: React.ForwardedRef<DCascaderRef> }
) => ReturnType<typeof Cascader> = React.forwardRef(Cascader) as any;
