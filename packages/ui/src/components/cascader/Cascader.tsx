/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';
import type { DSelectOption } from '../select';
import type { AbstractTreeNode, TreeOption } from '../tree/tree';
import type { Subject } from 'rxjs';

import { isNull, isUndefined } from 'lodash';
import React, { useCallback, useMemo, useState, useId, useEffect } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useGeneralState, useNotification, useAsync } from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DSelectBox } from '../_select-box';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';
import { SingleTreeNode } from '../tree/tree';
import { MultipleTreeNode } from '../tree/tree';
import { DList } from './List';
import { DSearchList } from './SearchList';

const OPTIONS_KEY = Symbol();
const SEPARATOR = ' / ';

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

  const [visible, _changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [_selects, changeSelects, { validateClassName, controlDisabled }] = useTwoWayBinding<T[] | null | T[][]>(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );
  const [listRendered, setListRendered] = useState(visible);
  const handleRendered = useCallback(() => {
    setListRendered(true);
  }, []);

  const changeVisible = useCallback(
    (visible) => {
      _changeVisible(visible);
      if (!visible) {
        setListRendered(false);
      }
    },
    [_changeVisible]
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const hasSearch = searchValue.length > 0;

  const renderOptions = useMemo(() => {
    let renderOptions: SingleTreeNode[] | MultipleTreeNode[] = [];
    if (dMultiple) {
      const selects = getSelects(dMultiple, _selects);

      renderOptions = dOptions.map((option) => new MultipleTreeNode(option, { checkeds: selects, getId: dGetId }));
    } else {
      const selects = getSelects(dMultiple, _selects);

      renderOptions = dOptions.map((option) => new SingleTreeNode(option, { checkeds: selects ?? [], getId: dGetId }));
    }
    return renderOptions;
  }, [_selects, dGetId, dMultiple, dOptions]);

  const searchOptions = useMemo(() => {
    const searchOptions: Array<DSelectOption<T[]>> = [];
    if (hasSearch) {
      const defaultFilterFn = (value: string, options: Array<DCascaderOption<T>>) => {
        return options.some((option) => option.dLabel.includes(value));
      };
      const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

      const reduceOptions = (options: Array<DCascaderOption<T>>, parent?: Array<DCascaderOption<T>>) => {
        options.forEach((option) => {
          const arr = (parent ?? []).concat([option]);
          if ((!dMultiple && !dOnlyLeafSelectable) || !option.dChildren) {
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
              searchOptions.push({ dLabel: label.join(SEPARATOR), dValue: value, dDisabled: disabled, [OPTIONS_KEY]: arr });
            }
          }
          if (option.dChildren) {
            reduceOptions(option.dChildren, arr);
          }
        });
      };
      reduceOptions(dOptions);

      const sortFn = dCustomSearch?.sort;
      if (sortFn) {
        searchOptions.sort((a, b) => sortFn(a[OPTIONS_KEY] as Array<DCascaderOption<T>>, b[OPTIONS_KEY] as Array<DCascaderOption<T>>));
      }
    }
    return searchOptions;
  }, [dCustomSearch, dMultiple, dOnlyLeafSelectable, dOptions, hasSearch, searchValue]);

  const [focusValues, setFocusValues] = useState<AbstractTreeNode[]>(() => {
    let optionFirstChecked: AbstractTreeNode | null = null;

    if (!isNull(_selects) && _selects.length > 0) {
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

  const removeOption = useCallback(
    (option: Array<DCascaderOption<T>>) => {
      if (!option.some((o) => o.dDisabled)) {
        const optionIds = option.map((o) => dGetId(o.dValue));
        changeSelects((draft) => {
          const index = (draft as T[][]).findIndex((item) => item.every((v, i) => dGetId(v) === optionIds[i]));
          if (index !== -1) {
            (draft as T[][]).splice(index, 1);
          }
        });
      }
    },
    [changeSelects, dGetId]
  );

  const handleClear = useCallback(() => {
    if (dMultiple) {
      changeSelects([]);
    } else {
      changeSelects(null);
    }
  }, [dMultiple, changeSelects]);

  const handleSearch = useCallback(
    (value: string) => {
      onSearch?.(value);
      setSearchValue(value);
    },
    [onSearch]
  );

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (listRendered && focusValues.length === 0) {
      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          switch (e.code) {
            case 'ArrowDown':
              e.preventDefault();
              for (const option of renderOptions) {
                if (!option.disabled) {
                  onFocusChange?.(option.value);
                  setFocusValues(option.value);
                  break;
                }
              }
              break;

            default:
              break;
          }
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, focusValues.length, listRendered, onFocusChange, renderOptions]);

  const hasSelected = dMultiple ? (_selects as T[][]).length > 0 : !isNull(_selects);

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selects = getSelects(dMultiple, _selects);

      let optionsSelecteds: Array<Array<DCascaderOption<T>>> = [];
      const customSelected = Symbol();
      const selectIds = selects.map((item) => item.map((v) => dGetId(v)));
      const reduceArr = (arr: Array<DCascaderOption<T>>, parent: Array<DCascaderOption<T>>) => {
        arr.forEach((item) => {
          const list = parent.concat([item]);
          const listIds = list.map((item) => dGetId(item.dValue));
          if (item.dChildren) {
            reduceArr(item.dChildren, list);
          }

          if (selectIds.some((ids) => ids.every((id, index) => id === listIds[index]))) {
            optionsSelecteds.push(list);
          }
        });
      };
      reduceArr(dOptions, []);

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
            const id = item.map((o) => dGetId(o.dValue)).join('$$');
            const isDisabled = item.some((o) => o.dDisabled);
            return (
              <DDropdownItem
                key={id}
                dId={id}
                dDisabled={isDisabled}
                onClick={() => {
                  if (!(disabled || isDisabled)) {
                    removeOption(item);
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
        const id = item.map((o) => dGetId(o.dValue)).join('$$');
        const isDisabled = item.some((o) => o.dDisabled);

        return (
          <DTag
            key={id}
            dSize={size}
            dClosable={!isDisabled}
            onClose={() => {
              clearTidNotification.next();

              if (!(disabled || isDisabled)) {
                removeOption(item);
              }
            }}
          >
            {(item[customSelected] as string) ?? item[item.length - 1].dLabel}
          </DTag>
        );
      });
    } else {
      const select = getSelects(dMultiple, _selects);

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
  }, [dMultiple, _selects, dOptions, dCustomSelected, dPrefix, size, dGetId, clearTidNotification, disabled, removeOption]);

  const contextValue = useMemo<DCascaderContextData>(
    () => ({
      cascaderSelecteds: _selects,
      cascaderFocusValues: focusValues,
      cascaderUniqueId: uniqueId,
      cascaderRendered: listRendered,
      cascaderMultiple: dMultiple,
      cascaderOnlyLeafSelectable: dOnlyLeafSelectable,
      cascaderClearTidNotification: clearTidNotification,
      cascaderOptionRender: dOptionRender,
      cascaderGetId: dGetId,
      onModelChange: (selects) => {
        changeSelects(selects);
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
      _selects,
      changeSelects,
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
