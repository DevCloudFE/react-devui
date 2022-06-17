import type { DId, DNestedChildren } from '../../utils/global';
import type { DExtendsSelectboxProps } from '../_selectbox';
import type { DDropdownOption } from '../dropdown';
import type { DSelectOption } from '../select';
import type { AbstractTreeNode } from '../tree';

import { isArray, isNull } from 'lodash';
import React, { useCallback, useMemo, useState, useId, useRef } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { LoadingOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DSelectbox } from '../_selectbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { DTag } from '../tag';
import { useTreeData } from '../tree';
import { SingleTreeNode, MultipleTreeNode } from '../tree';
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

export interface DCascaderProps<V extends DId, T extends DCascaderOption<V>>
  extends React.HTMLAttributes<HTMLDivElement>,
    DExtendsSelectboxProps {
  dModel?: V | null | V[];
  dOptions: DNestedChildren<T>[];
  dVisible?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomOption?: (option: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCustomSearch?: {
    filter?: (value: string, option: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dPopupClassName?: string;
  onModelChange?: (value: any, option: any) => void;
  onSearch?: (value: string) => void;
  onFocusChange?: (value: V, option: DNestedChildren<T>) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DCascader' });
function Cascader<V extends DId, T extends DCascaderOption<V>>(props: DCascaderProps<V, T>, ref: React.ForwardedRef<DCascaderRef>) {
  const {
    dModel,
    dOptions,
    dVisible,
    dMultiple = false,
    dOnlyLeafSelectable = true,
    dCustomOption,
    dCustomSelected,
    dCustomSearch,
    dPopupClassName,
    onModelChange,
    onSearch,
    onFocusChange,

    dFormControl,
    dLoading,
    dSearchable,
    dDisabled,
    dSize,
    dInputProps,
    onVisibleChange,
    onClear,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLDivElement>(null);
  //#endregion

  const uniqueId = useId();
  const listId = `${dPrefix}cascader-list-${uniqueId}`;
  const getOptionId = (val: V) => `${dPrefix}cascader-option-${val}-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);
  const formControlInject = useFormControl(dFormControl);
  const [select, changeSelect] = useDValue<V | null | V[]>(
    dMultiple ? [] : null,
    dModel,
    (value) => {
      if (onModelChange) {
        if (isArray(value)) {
          let length = value.length;
          const options: DNestedChildren<T>[] = [];
          const reduceArr = (arr: DNestedChildren<T>[]) => {
            for (const item of arr) {
              if (length === 0) {
                break;
              }
              if (item.children) {
                reduceArr(item.children);
              } else {
                const index = value.findIndex((val) => val === item.value);
                if (index !== -1) {
                  options[index] = item;
                  length -= 1;
                }
              }
            }
          };
          reduceArr(dOptions);

          onModelChange(value, options);
        } else {
          if (isNull(value)) {
            onModelChange(value, null);
          } else {
            onModelChange(
              value,
              findNested(dOptions, (option) => option.value === value)
            );
          }
        }
      }
    },
    undefined,
    formControlInject
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as V[]).length > 0 : !isNull(select);

  const checkedRef = useRef<SingleTreeNode<V, T>>();
  const getRenderNodes = useCallback(
    (select: V | null | V[]) => {
      let renderNodes: SingleTreeNode<V, T>[] | MultipleTreeNode<V, T>[] = [];
      if (dMultiple) {
        renderNodes = dOptions.map(
          (option) =>
            new MultipleTreeNode(option, (o) => o.value, {
              checkeds: select as V[],
              disabled: option.disabled,
            })
        );
      } else {
        renderNodes = dOptions.map(
          (option) =>
            new SingleTreeNode(option, (o) => o.value, {
              checkedRef,
              checked: select as V | null,
              disabled: option.disabled,
            })
        );
      }
      return renderNodes;
    },
    [dMultiple, dOptions]
  );
  const [renderNodes, changeSelectByCache] = useTreeData(select, getRenderNodes, changeSelect);

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
  const searchOptions = useMemo(() => {
    const searchOptions: DSearchOption<V, T>[] = [];
    if (hasSearch) {
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
    }
    return searchOptions;
  }, [dMultiple, dOnlyLeafSelectable, filterFn, hasSearch, renderNodes, sortFn]);

  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const [_noSearchFocusNode, setNoSearchFocusNode] = useState<AbstractTreeNode<V, T> | undefined>();
  const noSearchFocusNode = useMemo(() => {
    if (
      _noSearchFocusNode &&
      findNested(renderNodes as AbstractTreeNode<V, T>[], (node) => node.enabled && node.id === _noSearchFocusNode.id)
    ) {
      return _noSearchFocusNode;
    }

    if (isArray(select)) {
      if (select.length > 0) {
        return findNested(renderNodes as AbstractTreeNode<V, T>[], (node) => node.enabled && node.checked);
      }
    } else {
      if (!isNull(select)) {
        return findNested(renderNodes as AbstractTreeNode<V, T>[], (node) => node.enabled && node.checked);
      }
    }
  }, [_noSearchFocusNode, renderNodes, select]);

  const [_searchFocusOption, setSearchFocusOption] = useState<DSearchOption<V, T> | undefined>();
  const searchFocusOption = useMemo(() => {
    if (_searchFocusOption && findNested(searchOptions, (o) => o[TREE_NODE_KEY].enabled && o.value === _searchFocusOption.value)) {
      return _searchFocusOption;
    }

    if (hasSearch) {
      return findNested(searchOptions, (o) => o[TREE_NODE_KEY].enabled);
    }
  }, [_searchFocusOption, hasSearch, searchOptions]);

  const handleClear = () => {
    onClear?.();

    if (dMultiple) {
      changeSelect([]);
    } else {
      changeSelect(null);
    }
  };

  const [onKeyDown$] = useState(() => new Subject<React.KeyboardEvent<HTMLInputElement>>());

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selectedNodes: MultipleTreeNode<V, T>[] = [];
      let length = (select as V[]).length;
      const reduceArr = (arr: MultipleTreeNode<V, T>[]) => {
        for (const item of arr) {
          if (length === 0) {
            break;
          }
          if (item.children) {
            reduceArr(item.children);
          } else {
            const index = (select as V[]).findIndex((val) => val === item.id);
            if (index !== -1) {
              selectedNodes[index] = item;
              length -= 1;
            }
          }
        }
      };
      reduceArr(renderNodes as MultipleTreeNode<V, T>[]);

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
            const checkeds = (option.node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as V[]);
            changeSelectByCache(checkeds);
          }}
        >
          <DTag className={`${dPrefix}cascader__multiple-count`} dSize={size}>
            {(select as V[]).length}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedNodes.map((node) => (
        <DTag
          key={node.id}
          className={`${dPrefix}cascader__multiple-tag`}
          dSize={size}
          dClosable={!(node.disabled || disabled)}
          onCloseClick={(e) => {
            e.stopPropagation();

            const checkeds = (node as MultipleTreeNode<V, T>).changeStatus('UNCHECKED', select as V[]);
            changeSelectByCache(checkeds);
          }}
        >
          {dCustomSelected ? dCustomSelected(node.origin) : node.origin.label}
        </DTag>
      ));
    } else {
      if (!isNull(select)) {
        const node = findNested(renderNodes as SingleTreeNode<V, T>[], (node) => node.id === (select as V));
        if (node) {
          selectedLabel = getText(node);
          selectedNode = dCustomSelected ? dCustomSelected(node.origin) : selectedLabel;
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  }, [changeSelectByCache, dCustomSelected, dMultiple, dPrefix, disabled, renderNodes, select, size]);

  return (
    <DSelectbox
      {...restProps}
      ref={ref}
      className={getClassName(className, `${dPrefix}cascader`)}
      dFormControl={dFormControl}
      dVisible={visible}
      dContent={hasSelected && selectedNode}
      dContentTitle={selectedLabel}
      dSuffix={suffixNode}
      dSize={size}
      dLoading={dLoading}
      dSearchable={dSearchable}
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
      onUpdatePosition={(boxEl) => {
        const popupEl = popupRef.current;
        if (popupEl) {
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
        }
      }}
      onVisibleChange={changeVisible}
      onFocusVisibleChange={setIsFocusVisible}
      onClear={handleClear}
    >
      {({ sStyle, sOnMouseDown, sOnMouseUp, ...restSProps }) => (
        <div
          {...restSProps}
          ref={popupRef}
          className={getClassName(dPopupClassName, `${dPrefix}cascader__popup`)}
          style={sStyle}
          onMouseDown={sOnMouseDown}
          onMouseUp={sOnMouseUp}
        >
          {dLoading && (
            <div
              className={getClassName(`${dPrefix}cascader__loading`, {
                [`${dPrefix}cascader__loading--empty`]: dOptions.length === 0,
              })}
            >
              <LoadingOutlined dSize={dOptions.length === 0 ? 18 : 24} dSpin />
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
              dFocusVisible={isFocusVisible}
              onSelectedChange={changeSelectByCache}
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
              dFocusVisible={isFocusVisible}
              dRoot
              onSelectedChange={changeSelectByCache}
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
