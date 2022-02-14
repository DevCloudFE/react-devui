import type { DUpdater } from '../../hooks/two-way-binding';
import type { DExtendsSelectBoxProps } from '../_select-box';
import type { DSelectOption } from '../select';
import type { AbstractTreeNode, TreeOption } from '../tree';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useMemo, useState, useId, useEffect, useRef } from 'react';
import { filter } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useAsync, useIsomorphicLayoutEffect } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DSelectBox } from '../_select-box';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';
import { useTreeData } from '../tree';
import { SingleTreeNode, MultipleTreeNode } from '../tree';
import { DList } from './List';
import { DSearchList } from './SearchList';
import { ID_SEPARATOR, OPTIONS_KEY, SEPARATOR, TREE_NODE_KEY } from './utils';

export interface DCascaderContextData<T> {
  gSelecteds: T[] | null | T[][];
  gFocusValues: T[];
  gUniqueId: string;
  gRendered: boolean;
  gMultiple: boolean;
  gOnlyLeafSelectable: boolean;
  gOptionRender: NonNullable<DCascaderBaseProps<T>['dOptionRender']>;
  gGetId: NonNullable<DCascaderBaseProps<T>['dGetId']>;
  gOnModelChange: (value: T[] | null | T[][]) => void;
  gOnFocusValuesChange: (value: T[]) => void;
  gOnClose: () => void;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DCascaderContext = React.createContext<DCascaderContextData<any> | null>(null);

export interface DCascaderOption<T> extends TreeOption<T> {
  dValue: T;
  dLoading?: boolean;
  dChildren?: DCascaderOption<T>[];
}

export interface DCascaderBaseProps<T> extends React.HTMLAttributes<HTMLDivElement>, DExtendsSelectBoxProps {
  dFormControlName?: string;
  dVisible?: [boolean, DUpdater<boolean>?];
  dOptions: DCascaderOption<T>[];
  dOptionRender?: (option: DCascaderOption<T>) => React.ReactNode;
  dGetId?: (value: T) => string;
  dClearable?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, options: DCascaderOption<T>[]) => boolean;
    sort?: (a: DCascaderOption<T>[], b: DCascaderOption<T>[]) => number;
  };
  dAutoMaxWidth?: boolean;
  onFocusChange?: (value: T[]) => void;
}

export interface DCascaderSingleProps<T> extends DCascaderBaseProps<T> {
  dModel?: [T[] | null, DUpdater<T[] | null>?];
  dMultiple?: false;
  dCustomSelected?: (select: DCascaderOption<T>[]) => string;
  onModelChange?: (value: T[] | null) => void;
}

export interface DCascaderMultipleProps<T> extends DCascaderBaseProps<T> {
  dModel?: [T[][], DUpdater<T[][]>?];
  dMultiple: true;
  dCustomSelected?: (select: DCascaderOption<T>[][]) => string[];
  onModelChange?: (values: T[][]) => void;
}

export interface DCascaderProps<T = unknown> extends DCascaderBaseProps<T> {
  dModel?: DCascaderSingleProps<T>['dModel'] | DCascaderMultipleProps<T>['dModel'];
  dMultiple?: boolean;
  dCustomSelected?: DCascaderSingleProps<T>['dCustomSelected'] | DCascaderMultipleProps<T>['dCustomSelected'];
  onModelChange?: DCascaderSingleProps<T>['onModelChange'] | DCascaderMultipleProps<T>['onModelChange'];
}

const { COMPONENT_NAME } = generateComponentMate('DCascader');
const DEFAULT_PROPS = {
  dOptionRender: (option: DCascaderOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DCascader<T>(props: DCascaderSingleProps<T>): JSX.Element | null;
export function DCascader<T>(props: DCascaderMultipleProps<T>): JSX.Element | null;
export function DCascader<T>(props: DCascaderProps<T>): JSX.Element | null;
export function DCascader<T>(props: DCascaderProps<T>): JSX.Element | null {
  const {
    dFormControlName,
    dModel,
    dVisible,
    dOptions,
    dOptionRender = DEFAULT_PROPS.dOptionRender,
    dCustomSelected,
    dGetId = DEFAULT_PROPS.dGetId,
    dClearable = false,
    dOnlyLeafSelectable = true,
    dCustomSearch,
    dLoading = false,
    dMultiple = false,
    dDisabled = false,
    dPopupClassName,
    dAutoMaxWidth = true,
    dSize,
    onVisibleChange,
    onFocusChange,
    onModelChange,
    onClear,
    onSearch,
    id,
    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const asyncCapture = useAsync();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}cascader-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);
  const [select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding<T[] | null | T[][]>(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    { formControlName: dFormControlName, id: _id }
  );

  const [rendered, setRendered] = useState(visible);
  useIsomorphicLayoutEffect(() => {
    if (!visible) {
      setRendered(false);
    }
  }, [visible]);
  const listRendered = visible && rendered;

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as T[][]).length > 0 : !isNull(select);

  const checkedRef = useRef({});
  const getRenderOptions = useCallback(
    (select: T[] | null | T[][]) => {
      let renderOptions: SingleTreeNode<T, DCascaderOption<T>>[] | MultipleTreeNode<T, DCascaderOption<T>>[] = [];
      if (dMultiple) {
        renderOptions = dOptions.map((option) => new MultipleTreeNode(option, { checkeds: select as T[][], getId: dGetId }));
      } else {
        renderOptions = dOptions.map(
          (option) => new SingleTreeNode(option, { checkedRef, checkeds: (select as T[] | null) ?? [], getId: dGetId })
        );
      }
      return renderOptions;
    },
    [dGetId, dMultiple, dOptions]
  );
  const [renderOptions, changeSelectByCache] = useTreeData(select, getRenderOptions, changeSelect);

  const searchOptions = (() => {
    const searchOptions: DSelectOption<T[]>[] = [];
    if (hasSearch) {
      const defaultFilterFn = (value: string, options: DCascaderOption<T>[]) => {
        return options.some((option) => option.dLabel.includes(value));
      };
      const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

      const reduceOptions = (options: AbstractTreeNode<T, DCascaderOption<T>>[], parent?: DCascaderOption<T>[]) => {
        options.forEach((option) => {
          const arr = (parent ?? []).concat([option.node]);
          if ((!dMultiple && !dOnlyLeafSelectable) || option.isLeaf) {
            const label: string[] = [];
            const value: T[] = [];
            let disabled = false;
            arr.forEach((item) => {
              label.push(item.dLabel);
              value.push(item.dValue);
              if (item.dDisabled) {
                disabled = true;
              }
            });

            if (filterFn(searchValue, arr)) {
              searchOptions.push({
                dLabel: label.join(SEPARATOR),
                dValue: value,
                dDisabled: disabled,
                [OPTIONS_KEY]: arr,
                [TREE_NODE_KEY]: option,
              });
            }
          }
          if (option.children) {
            reduceOptions(option.children, arr);
          }
        });
      };
      reduceOptions(renderOptions);

      const sortFn = dCustomSearch?.sort;
      if (sortFn) {
        searchOptions.sort((a, b) => sortFn(a[OPTIONS_KEY] as DCascaderOption<T>[], b[OPTIONS_KEY] as DCascaderOption<T>[]));
      }
    }
    return searchOptions;
  })();

  const [focusValues, setFocusValues] = useState<T[]>(() => {
    let focusValues: T[] | null = null;

    if (!isNull(select) && select.length > 0) {
      const reduceArr = (arr: AbstractTreeNode<T, DCascaderOption<T>>[]) => {
        for (const item of arr) {
          if (focusValues) {
            break;
          }
          if (!item.disabled) {
            if (item.children) {
              reduceArr(item.children);
            } else {
              if (item.checked) {
                focusValues = item.value;
              }
            }
          }
        }
      };
      reduceArr(renderOptions);
    }

    return focusValues ?? [];
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchOptionRender = (option: any) => {
    return (option[OPTIONS_KEY] as DCascaderOption<T>[]).map((item, index) => (
      <React.Fragment key={index}>
        {dOptionRender(item)}
        {index === option[OPTIONS_KEY].length - 1 ? '' : SEPARATOR}
      </React.Fragment>
    ));
  };

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (!hasSearch && listRendered && focusValues.length === 0) {
      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'ArrowDown'))
        .subscribe({
          next: (e) => {
            e.preventDefault();
            for (const option of renderOptions) {
              if (!option.disabled) {
                onFocusChange?.(option.value);
                setFocusValues(option.value);
                break;
              }
            }
          },
        });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, focusValues.length, hasSearch, listRendered, onFocusChange, renderOptions]);

  const gOnModelChange = useCallback(
    (select) => {
      changeSelectByCache(select);
    },
    [changeSelectByCache]
  );
  const gOnFocusValuesChange = useCallback(
    (value) => {
      onFocusChange?.(value);
      setFocusValues(value);
    },
    [onFocusChange]
  );
  const gOnClose = useCallback(() => {
    changeVisible(false);
  }, [changeVisible]);
  const contextValue = useMemo<DCascaderContextData<T>>(
    () => ({
      gSelecteds: select,
      gFocusValues: focusValues,
      gUniqueId: uniqueId,
      gRendered: listRendered,
      gMultiple: dMultiple,
      gOnlyLeafSelectable: dOnlyLeafSelectable,
      gOptionRender: dOptionRender,
      gGetId: dGetId,
      gOnModelChange,
      gOnFocusValuesChange,
      gOnClose,
    }),
    [
      select,
      focusValues,
      uniqueId,
      listRendered,
      dMultiple,
      dOnlyLeafSelectable,
      dOptionRender,
      dGetId,
      gOnModelChange,
      gOnFocusValuesChange,
      gOnClose,
    ]
  );

  const handleClear = () => {
    onClear?.();

    if (dMultiple) {
      changeSelect([]);
    } else {
      changeSelect(null);
    }
  };

  const handleSearch = (value: string) => {
    onSearch?.(value);
    setSearchValue(value);
  };

  const [selectedNode, suffixNode, selectedLabel] = (() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      let optionsSelecteds: DCascaderOption<T>[][] = [];
      const customSelected = Symbol();
      const reduceArr = (arr: AbstractTreeNode<T, DCascaderOption<T>>[], parent: DCascaderOption<T>[]) => {
        for (const item of arr) {
          const list = parent.concat([Object.assign(item.node, { [TREE_NODE_KEY]: item })]);
          if (item.children) {
            reduceArr(item.children, list);
          } else if (item.checked) {
            optionsSelecteds.push(list);
          }
        }
      };
      reduceArr(renderOptions, []);

      if (dCustomSelected) {
        optionsSelecteds = (dCustomSelected as NonNullable<DCascaderMultipleProps<T>['dCustomSelected']>)(optionsSelecteds).map(
          (item, index) => Object.assign(optionsSelecteds[index], { [customSelected]: item })
        );
      }

      suffixNode = (
        <DDropdown
          dTriggerNode={
            <DTag className={`${dPrefix}select__multiple-count`} dSize={size}>
              {(select as T[][]).length} ...
            </DTag>
          }
          dCloseOnItemClick={false}
        >
          {optionsSelecteds.map((item) => {
            const node = item[item.length - 1][TREE_NODE_KEY] as MultipleTreeNode<T, DCascaderOption<T>>;
            const id = node.id.join(ID_SEPARATOR);

            return (
              <DDropdownItem
                key={id}
                dId={id}
                dDisabled={node.disabled}
                onClick={() => {
                  if (!disabled && node.enabled) {
                    const checkeds = node.changeStatus('UNCHECKED', select as T[][]);
                    changeSelectByCache(checkeds);
                  }
                }}
              >
                {(item[customSelected] as string) ?? item.map((o) => o.dLabel).join(SEPARATOR)}
              </DDropdownItem>
            );
          })}
        </DDropdown>
      );
      selectedNode = optionsSelecteds.map((item) => {
        const node = item[item.length - 1][TREE_NODE_KEY] as MultipleTreeNode<T, DCascaderOption<T>>;
        const id = node.id.join(ID_SEPARATOR);

        return (
          <DTag
            key={id}
            dSize={size}
            dClosable={node.enabled}
            onClose={() => {
              if (!disabled && node.enabled) {
                const checkeds = node.changeStatus('UNCHECKED', select as T[][]);
                changeSelectByCache(checkeds);
              }
            }}
          >
            {(item[customSelected] as string) ?? item[item.length - 1].dLabel}
          </DTag>
        );
      });
    } else {
      if (!isNull(select)) {
        const ids = (select as T[]).map((v) => dGetId(v));
        let option: DCascaderOption<T>[] | null = null;
        const reduceArr = (arr: DCascaderOption<T>[], parent: DCascaderOption<T>[]) => {
          for (const item of arr) {
            if (option) {
              break;
            }
            const list = parent.concat([item]);
            const listIds = list.map((item) => dGetId(item.dValue));
            if (ids.every((id, index) => id === listIds[index])) {
              option = list;
            }
            if (item.dChildren) {
              reduceArr(item.dChildren, list);
            }
          }
        };
        reduceArr(dOptions, []);

        if (option) {
          selectedLabel = (option as DCascaderOption<T>[]).map((o) => o.dLabel).join(SEPARATOR);
          if (dCustomSelected) {
            selectedNode = dCustomSelected(option);
          } else {
            selectedNode = selectedLabel;
          }
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  })();

  return (
    <DCascaderContext.Provider value={contextValue}>
      <DSelectBox
        {...restProps}
        id={_id}
        className={getClassName(className, `${dPrefix}select`, validateClassName, {
          [`${dPrefix}select--multiple`]: dMultiple,
        })}
        dPopupContent={
          <>
            {dLoading && (
              <span
                className={getClassName(`${dPrefix}select__loading`, {
                  [`${dPrefix}select__loading--empty`]: dOptions.length === 0,
                })}
              >
                <DIcon viewBox="0 0 1024 1024" dSize={dOptions.length === 0 ? 18 : 24} dSpin>
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                </DIcon>
              </span>
            )}
            {hasSearch ? (
              <DSearchList dOptions={searchOptions} dOptionRender={searchOptionRender} dSearchValue={searchValue}></DSearchList>
            ) : (
              <DList dList={renderOptions}></DList>
            )}
          </>
        }
        dSuffix={suffixNode}
        dVisible={visible}
        dShowClear={dClearable && hasSelected}
        dContentTitle={selectedLabel}
        dLoading={dLoading}
        dDisabled={disabled}
        dSize={size}
        dPopupClassName={getClassName(dPopupClassName, `${dPrefix}select-popup`, `${dPrefix}cascader-popup`)}
        dCustomWidth
        dAutoMaxWidth={dAutoMaxWidth}
        onClear={handleClear}
        onSearch={handleSearch}
        onVisibleChange={changeVisible}
        onRendered={() => {
          setRendered(true);
        }}
      >
        {hasSelected && selectedNode}
      </DSelectBox>
    </DCascaderContext.Provider>
  );
}
