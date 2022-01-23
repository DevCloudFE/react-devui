/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';
import type { DSelectOption } from '../select';
import type { AbstractTreeNode, TreeOption } from '../tree';
import type { Subject } from 'rxjs';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useMemo, useState, useId, useEffect, useRef } from 'react';
import { filter } from 'rxjs';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useNotification, useAsync } from '../../hooks';
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

function getSelects<T>(multiple: false, select: T[] | null | T[][]): T[] | null;
function getSelects<T>(multiple: true, select: T[] | null | T[][]): T[][];
function getSelects<T>(multiple: boolean, select: T[] | null | T[][]) {
  return select;
}

export interface DCascaderContextData {
  cascaderSelecteds: any[] | null | any[][];
  cascaderFocusValues: any[];
  cascaderUniqueId: string;
  cascaderRendered: boolean;
  cascaderMultiple: boolean;
  cascaderOnlyLeafSelectable: boolean;
  cascaderClearTidNotification: Subject<void>;
  cascaderOptionRender: NonNullable<DCascaderBaseProps<any>['dOptionRender']>;
  cascaderGetId: NonNullable<DCascaderBaseProps<any>['dGetId']>;
  onModelChange: (value: any[] | null | any[][]) => void;
  onFocusValuesChange: (value: any[]) => void;
  onClose: () => void;
}
export const DCascaderContext = React.createContext<DCascaderContextData | null>(null);

export interface DCascaderOption<T> extends TreeOption {
  dValue: T;
  dLoading?: boolean;
  dChildren?: Array<DCascaderOption<T>>;
}

type PickSelectBoxProps = Pick<
  DSelectBoxProps,
  'dSearchable' | 'dClearIcon' | 'dSize' | 'dPlaceholder' | 'dDisabled' | 'dLoading' | 'dPopupClassName' | 'onClear' | 'onSearch'
>;

export interface DCascaderBaseProps<T> extends React.HTMLAttributes<HTMLDivElement>, PickSelectBoxProps {
  dFormControlName?: string;
  dVisible?: [boolean, Updater<boolean>?];
  dOptions: Array<DCascaderOption<T>>;
  dOptionRender?: (option: DCascaderOption<T>) => React.ReactNode;
  dGetId?: (value: T) => string;
  dClearable?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, options: Array<DCascaderOption<T>>) => boolean;
    sort?: (a: Array<DCascaderOption<T>>, b: Array<DCascaderOption<T>>) => number;
  };
  dPopupClassName?: string;
  dAutoMaxWidth?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  onFocusChange?: (value: T[]) => void;
}

export interface DCascaderSingleProps<T> extends DCascaderBaseProps<T> {
  dModel?: [T[] | null, Updater<T[] | null>?];
  dMultiple?: false;
  dCustomSelected?: (select: Array<DCascaderOption<T>>) => string;
  onModelChange?: (value: T[] | null) => void;
}

export interface DCascaderMultipleProps<T> extends DCascaderBaseProps<T> {
  dModel?: [T[][], Updater<T[][]>?];
  dMultiple: true;
  dCustomSelected?: (selects: Array<Array<DCascaderOption<T>>>) => string[];
  onModelChange?: (values: T[][]) => void;
}

export type DCascaderProps<T = unknown> = DCascaderBaseProps<T> & {
  dModel?: [any, Updater<any>?];
  dMultiple?: boolean;
  dCustomSelected?: (select: any) => string | string[];
  onModelChange?: (value: any) => void;
};

const { COMPONENT_NAME } = generateComponentMate('DCascader');
const DEFAULT_PROPS = {
  dOptionRender: (option: DCascaderOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DCascader<T>(props: DCascaderSingleProps<T>): React.ReactElement;
export function DCascader<T>(props: DCascaderMultipleProps<T>): React.ReactElement;
export function DCascader<T>(props: DCascaderProps<T>): React.ReactElement;
export function DCascader<T>(props: DCascaderProps<T>) {
  const {
    dModel,
    dFormControlName,
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
  const [clearTidNotification, clearTidNotificationCallback] = useNotification<void>();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}cascader-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [_select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding<T[] | null | T[][]>(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const [rendered, setRendered] = useState(visible);
  const handleRendered = useCallback(() => {
    setRendered(true);
  }, []);
  useEffect(() => {
    if (!visible) {
      setRendered(false);
    }
  }, [visible]);
  const listRendered = visible && rendered;

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const hasSearch = searchValue.length > 0;

  const checkedRef = useRef({});
  const getRenderOptions = useCallback(
    (select: T[] | null | T[][]) => {
      let renderOptions: SingleTreeNode[] | MultipleTreeNode[] = [];
      if (dMultiple) {
        renderOptions = dOptions.map((option) => new MultipleTreeNode(option, { checkeds: select as T[][], getId: dGetId }));
      } else {
        renderOptions = dOptions.map((option) => new SingleTreeNode(option, { checkedRef, checkeds: select ?? [], getId: dGetId }));
      }
      return renderOptions;
    },
    [dGetId, dMultiple, dOptions]
  );
  const [renderOptions, changeSelectByCache] = useTreeData(_select, getRenderOptions, changeSelect);

  const searchOptions = useMemo(() => {
    const searchOptions: Array<DSelectOption<T[]>> = [];
    if (hasSearch) {
      const defaultFilterFn = (value: string, options: Array<DCascaderOption<T>>) => {
        return options.some((option) => option.dLabel.includes(value));
      };
      const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

      const reduceOptions = (options: AbstractTreeNode[], parent?: Array<DCascaderOption<T>>) => {
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
          if (!option.isLeaf) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            reduceOptions(option.children!, arr);
          }
        });
      };
      reduceOptions(renderOptions);

      const sortFn = dCustomSearch?.sort;
      if (sortFn) {
        searchOptions.sort((a, b) => sortFn(a[OPTIONS_KEY] as Array<DCascaderOption<T>>, b[OPTIONS_KEY] as Array<DCascaderOption<T>>));
      }
    }
    return searchOptions;
  }, [dCustomSearch, dMultiple, dOnlyLeafSelectable, hasSearch, renderOptions, searchValue]);

  const [focusValues, setFocusValues] = useState<AbstractTreeNode[]>(() => {
    let optionFirstChecked: AbstractTreeNode | null = null;

    if (!isNull(_select) && _select.length > 0) {
      const reduceArr = (arr: AbstractTreeNode[]) => {
        for (const item of arr) {
          if (optionFirstChecked) {
            break;
          }
          if (!item.disabled) {
            if (item.isLeaf) {
              if (item.checked) {
                optionFirstChecked = item;
              }
            } else {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              reduceArr(item.children!);
            }
          }
        }
      };
      reduceArr(renderOptions);
    }

    return optionFirstChecked ? (optionFirstChecked as AbstractTreeNode).value : [];
  });

  const searchOptionRender = useCallback(
    (option) => {
      return (option[OPTIONS_KEY] as Array<DCascaderOption<T>>).map((item, index) => (
        <React.Fragment key={index}>
          {dOptionRender(item)}
          {index === option[OPTIONS_KEY].length - 1 ? '' : SEPARATOR}
        </React.Fragment>
      ));
    },
    [dOptionRender]
  );

  const handleClear = useCallback(() => {
    if (dMultiple) {
      changeSelect([]);
    } else {
      changeSelect(null);
    }
  }, [dMultiple, changeSelect]);

  const handleSearch = useCallback(
    (value: string) => {
      onSearch?.(value);
      setSearchValue(value);
    },
    [onSearch]
  );

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

  const hasSelected = dMultiple ? (_select as T[][]).length > 0 : !isNull(_select);

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selects = getSelects(dMultiple, _select);

      let optionsSelecteds: Array<Array<DCascaderOption<T>>> = [];
      const customSelected = Symbol();
      const reduceArr = (arr: AbstractTreeNode[], parent: Array<DCascaderOption<T>>) => {
        for (const item of arr) {
          const list = parent.concat([Object.assign(item.node, { [TREE_NODE_KEY]: item })]);
          if (!item.isLeaf) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            reduceArr(item.children!, list);
          } else if (item.checked) {
            optionsSelecteds.push(list);
          }
        }
      };
      reduceArr(renderOptions, []);

      if (dCustomSelected) {
        optionsSelecteds = (dCustomSelected(optionsSelecteds) as string[]).map((item, index) =>
          Object.assign(optionsSelecteds[index], { [customSelected]: item })
        );
      }

      suffixNode = (
        <DDropdown
          dTriggerNode={
            <DTag
              className={`${dPrefix}select__multiple-count`}
              dSize={size}
              onClick={() => {
                clearTidNotification.next();
              }}
            >
              {selects.length} ...
            </DTag>
          }
          dCloseOnItemClick={false}
          onClick={() => {
            clearTidNotification.next();
          }}
        >
          {optionsSelecteds.map((item) => {
            const node = item[item.length - 1][TREE_NODE_KEY] as MultipleTreeNode;
            const id = node.id.join(ID_SEPARATOR);

            return (
              <DDropdownItem
                key={id}
                dId={id}
                dDisabled={node.disabled}
                onClick={() => {
                  if (!disabled && node.enabled) {
                    const checkeds = node.changeStatus('UNCHECKED', selects);
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
        const node = item[item.length - 1][TREE_NODE_KEY] as MultipleTreeNode;
        const id = node.id.join(ID_SEPARATOR);

        return (
          <DTag
            key={id}
            dSize={size}
            dClosable={node.enabled}
            onClose={() => {
              clearTidNotification.next();

              if (!disabled && node.enabled) {
                const checkeds = node.changeStatus('UNCHECKED', selects);
                changeSelectByCache(checkeds);
              }
            }}
          >
            {(item[customSelected] as string) ?? item[item.length - 1].dLabel}
          </DTag>
        );
      });
    } else {
      const select = getSelects(dMultiple, _select);

      if (!isNull(select)) {
        const ids = select.map((v) => dGetId(v));
        let option: Array<DCascaderOption<T>> | null = null;
        const reduceArr = (arr: Array<DCascaderOption<T>>, parent: Array<DCascaderOption<T>>) => {
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
          selectedLabel = (option as Array<DCascaderOption<T>>).map((o) => o.dLabel).join(SEPARATOR);
          if (dCustomSelected) {
            selectedNode = dCustomSelected(option);
          } else {
            selectedNode = selectedLabel;
          }
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  }, [
    dMultiple,
    _select,
    renderOptions,
    dCustomSelected,
    dPrefix,
    size,
    dGetId,
    clearTidNotification,
    disabled,
    changeSelectByCache,
    dOptions,
  ]);

  const contextValue = useMemo<DCascaderContextData>(
    () => ({
      cascaderSelecteds: _select,
      cascaderFocusValues: focusValues,
      cascaderUniqueId: uniqueId,
      cascaderRendered: listRendered,
      cascaderMultiple: dMultiple,
      cascaderOnlyLeafSelectable: dOnlyLeafSelectable,
      cascaderClearTidNotification: clearTidNotification,
      cascaderOptionRender: dOptionRender,
      cascaderGetId: dGetId,
      onModelChange: (select) => {
        changeSelectByCache(select);
      },
      onFocusValuesChange: (value) => {
        onFocusChange?.(value);
        setFocusValues(value);
      },
      onClose: () => {
        changeVisible(false);
      },
    }),
    [
      _select,
      changeSelectByCache,
      changeVisible,
      clearTidNotification,
      dGetId,
      dMultiple,
      dOnlyLeafSelectable,
      dOptionRender,
      focusValues,
      listRendered,
      onFocusChange,
      uniqueId,
    ]
  );

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
        dClearTidCallback={clearTidNotificationCallback}
        dPopupClassName={getClassName(dPopupClassName, `${dPrefix}select-popup`, `${dPrefix}cascader-popup`)}
        dCustomWidth
        dAutoMaxWidth={dAutoMaxWidth}
        onClear={handleClear}
        onSearch={handleSearch}
        onVisibleChange={changeVisible}
        onRendered={handleRendered}
      >
        {hasSelected && selectedNode}
      </DSelectBox>
    </DCascaderContext.Provider>
  );
}
