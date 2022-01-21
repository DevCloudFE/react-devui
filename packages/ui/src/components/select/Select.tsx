/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';

import { isArray, isNull, isNumber, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState, useId } from 'react';
import { useLayoutEffect } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useAsync,
  useTranslation,
  useGeneralState,
  useNotification,
} from '../../hooks';
import { generateComponentMate, getClassName } from '../../utils';
import { DSelectBox } from '../_select-box';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';

const IS_GROUP = Symbol();
const IS_CREATE = Symbol();

function getSelect<T>(multiple: false, select: T | null | T[]): T | null;
function getSelect<T>(multiple: true, select: T | null | T[]): T[];
function getSelect<T>(multiple: boolean, select: T | null | T[]) {
  if (multiple && !isArray(select)) {
    throw new Error("Please pass Array when `dMultiple` is 'true'");
  }
  return select;
}

export interface DSelectBaseOption<T> {
  dLabel: string;
  dValue: T;
  dDisabled?: boolean;
  [index: string | symbol]: unknown;
}

export interface DSelectOption<T> {
  dLabel: string;
  dValue?: T;
  dDisabled?: boolean;
  dChildren?: Array<DSelectBaseOption<T>>;
  [index: string | symbol]: unknown;
}

type PickSelectBoxProps = Pick<
  DSelectBoxProps,
  'dSearchable' | 'dClearIcon' | 'dSize' | 'dPlaceholder' | 'dDisabled' | 'dLoading' | 'dPopupClassName' | 'onClear' | 'onSearch'
>;

export interface DSelectBaseProps<T> extends React.HTMLAttributes<HTMLDivElement>, PickSelectBoxProps {
  dFormControlName?: string;
  dVisible?: [boolean, Updater<boolean>?];
  dOptions: Array<DSelectOption<T>>;
  dOptionRender?: (option: DSelectBaseOption<T>) => React.ReactNode;
  dGetId?: (value: T) => string;
  dCreateOption?: (value: string) => DSelectBaseOption<T> | null;
  dClearable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, option: DSelectBaseOption<T>) => boolean;
    sort?: (a: DSelectBaseOption<T>, b: DSelectBaseOption<T>) => number;
  };
  dPopupClassName?: string;
  onVisibleChange?: (visible: boolean) => void;
  onScrollBottom?: () => void;
  onCreateOption?: (option: DSelectBaseOption<T>) => void;
}

export interface DSelectSingleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T | null, Updater<T | null>?];
  dMultiple?: false;
  dCustomSelected?: (select: DSelectBaseOption<T>) => string;
  onModelChange?: (value: T | null) => void;
}

export interface DSelectMultipleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T[], Updater<T[]>?];
  dMultiple: true;
  dMaxSelectNum?: number;
  dCustomSelected?: (selects: Array<DSelectBaseOption<T>>) => string[];
  onModelChange?: (values: T[]) => void;
  onExceed?: () => void;
}

export type DSelectProps<T = unknown> = DSelectBaseProps<T> & {
  dModel?: [any, Updater<any>?];
  dMultiple?: boolean;
  dMaxSelectNum?: number;
  dCustomSelected?: (select: any) => string | string[];
  onModelChange?: (value: any) => void;
  onExceed?: () => void;
};

const { COMPONENT_NAME } = generateComponentMate('DSelect');
const DEFAULT_PROPS = {
  dOptionRender: (option: DSelectBaseOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DSelect<T>(props: DSelectSingleProps<T>): React.ReactElement;
export function DSelect<T>(props: DSelectMultipleProps<T>): React.ReactElement;
export function DSelect<T>(props: DSelectProps<T>): React.ReactElement;
export function DSelect<T>(props: DSelectProps<T>) {
  const {
    dModel,
    dFormControlName,
    dVisible,
    dOptions,
    dOptionRender = DEFAULT_PROPS.dOptionRender,
    dCustomSelected,
    dGetId = DEFAULT_PROPS.dGetId,
    dCreateOption,
    dClearable = false,
    dCustomSearch,
    dLoading = false,
    dMultiple = false,
    dMaxSelectNum,
    dDisabled = false,
    dPopupClassName,
    dSize,
    onVisibleChange,
    onModelChange,
    onScrollBottom,
    onCreateOption,
    onSearch,
    onExceed,
    id,
    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();
  const [clearTidNotification, clearTidNotificationCallback] = useNotification<void>();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}select-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, _changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [_select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding<T | null | T[]>(
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
    const defaultFilterFn = (value: string, option: DSelectOption<T>) => {
      return option.dLabel.includes(value);
    };
    const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

    let createOption = hasSearch ? dCreateOption?.(searchValue) ?? null : null;
    if (createOption) {
      createOption = {
        ...createOption,
        [IS_CREATE]: true,
      };
    }

    let renderOptions: Array<DSelectOption<T>> = [];

    dOptions.forEach((item: DSelectOption<T>) => {
      if (isUndefined(item.dChildren)) {
        if (createOption && dGetId(item.dValue as T) === dGetId(createOption.dValue)) {
          createOption = null;
        }
        if (!hasSearch || filterFn(searchValue, item as DSelectBaseOption<T>)) {
          renderOptions.push(item);
        }
      } else {
        const groupOptions: Array<DSelectBaseOption<T>> = [];
        item.dChildren.forEach((groupItem) => {
          if (createOption && dGetId(groupItem.dValue) === dGetId(createOption.dValue)) {
            createOption = null;
          }
          if (!hasSearch || filterFn(searchValue, groupItem)) {
            groupOptions.push(groupItem);
          }
        });

        if (!hasSearch) {
          renderOptions.push({
            [IS_GROUP]: true,
            dLabel: item.dLabel,
            dChildren: groupOptions,
          });
        } else {
          renderOptions = renderOptions.concat(groupOptions);
        }
      }
    });

    const sortFn = dCustomSearch?.sort as any;
    if (sortFn && hasSearch) {
      renderOptions.sort(sortFn);
    }

    if (createOption) {
      renderOptions.unshift(createOption);
    }

    return renderOptions;
  }, [dCreateOption, dCustomSearch, dGetId, dOptions, hasSearch, searchValue]);

  const canSelectOption = useCallback((option) => !option.dDisabled && !option[IS_GROUP], []);
  const compareOption = useCallback(
    (a: DSelectOption<T>, b: DSelectOption<T>) => {
      if (a.dValue && b.dValue) {
        return dGetId(a.dValue) === dGetId(b.dValue);
      }

      return false;
    },
    [dGetId]
  );
  const findOption = useCallback(
    (fn: (option: DSelectOption<T>) => unknown, options?: Array<DSelectOption<T>>): DSelectOption<T> | null => {
      options = options ?? renderOptions;
      let option: DSelectOption<T> | null = null;
      let stop = false;
      const reduceArr = (arr: Array<DSelectOption<T>>) => {
        for (const item of arr) {
          if (stop) {
            break;
          }

          if (item.dChildren) {
            reduceArr(item.dChildren);
          } else if (fn(item)) {
            option = item;
            stop = true;
          }
        }
      };
      reduceArr(options);

      return option;
    },
    [renderOptions]
  );
  const getFocusOption = () => {
    let option: DSelectOption<T> | null = null;

    if (!hasSearch) {
      if (dMultiple) {
        const select = getSelect(dMultiple, _select);

        if (select.length > 0) {
          for (const id of select.map((item) => dGetId(item))) {
            option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
            if (option) {
              break;
            }
          }
        }
      } else {
        const select = getSelect(dMultiple, _select);

        if (!isNull(select)) {
          const id = dGetId(select);
          option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
        }
      }
    }

    if (isNull(option)) {
      option = findOption((o) => canSelectOption(o));
    }

    return option;
  };

  const [searchFocusOption, setSearchFocusOption] = useState(() => getFocusOption());
  const [noSearchFocusOption, setNoSearchFocusOption] = useState(() => getFocusOption());
  const focusOption = hasSearch ? searchFocusOption : noSearchFocusOption;
  const focusId = focusOption && focusOption.dValue ? dGetId(focusOption.dValue) : null;
  const changeFocusOption = useCallback(
    (option) => {
      hasSearch ? setSearchFocusOption(option) : setNoSearchFocusOption(option);
    },
    [hasSearch]
  );

  const handleOptionClick = useCallback(
    (option: DSelectOption<T>, isSwitch?: boolean) => {
      if (canSelectOption(option) && option.dValue) {
        const optionId = dGetId(option.dValue);
        if (dMultiple) {
          isSwitch = isSwitch ?? true;

          changeSelect((draft) => {
            const index = (draft as T[]).findIndex((item) => dGetId(item) === optionId);
            if (index !== -1) {
              isSwitch && (draft as T[]).splice(index, 1);
            } else {
              if (isNumber(dMaxSelectNum) && (draft as T[]).length === dMaxSelectNum) {
                onExceed?.();
              } else {
                (draft as T[]).push(option.dValue as T);
              }
            }
          });
        } else {
          changeSelect(option.dValue);
        }
      }

      if (!dMultiple) {
        changeVisible(false);
      }
    },
    [canSelectOption, changeSelect, changeVisible, dGetId, dMaxSelectNum, dMultiple, onExceed]
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
  useLayoutEffect(() => {
    if (hasSearch) {
      setSearchFocusOption(getFocusOption());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (listRendered && focusOption) {
      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          switch (e.code) {
            case 'Enter':
              e.preventDefault();
              handleOptionClick(focusOption, false);
              break;

            case 'Space':
              e.preventDefault();
              if (dMultiple) {
                handleOptionClick(focusOption, true);
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
  }, [asyncCapture, dMultiple, focusOption, handleOptionClick, listRendered]);

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const select = getSelect(dMultiple, _select);

      let optionsSelected: Array<DSelectBaseOption<T>> = [];
      const customSelected = Symbol();
      const selectIds = select.map((item) => dGetId(item));
      const reduceArr = (arr: Array<DSelectOption<T>>) => {
        arr.forEach((item) => {
          if (item.dChildren) {
            reduceArr(item.dChildren);
          } else if (item.dValue && selectIds.includes(dGetId(item.dValue))) {
            optionsSelected.push(item as DSelectBaseOption<T>);
          }
        });
      };
      reduceArr(dOptions);

      if (dCustomSelected) {
        optionsSelected = (dCustomSelected(optionsSelected) as string[]).map((item, index) =>
          Object.assign(optionsSelected[index], { [customSelected]: item })
        );
      }

      suffixNode = (
        <DDropdown
          dTriggerNode={
            <DTag
              className={`${dPrefix}select__multiple-count`}
              dSize={size}
              dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === select.length ? 'danger' : undefined}
              onClick={() => {
                clearTidNotification.next();
              }}
            >
              {select.length} ...
            </DTag>
          }
          dCloseOnItemClick={false}
          onClick={() => {
            clearTidNotification.next();
          }}
        >
          {optionsSelected.map((item) => {
            const id = dGetId(item.dValue);

            return (
              <DDropdownItem
                key={id}
                dId={id}
                dDisabled={item.dDisabled}
                onClick={() => {
                  if (!disabled) {
                    handleOptionClick(item);
                  }
                }}
              >
                {(item[customSelected] as string) ?? item.dLabel}
              </DDropdownItem>
            );
          })}
        </DDropdown>
      );
      selectedNode = optionsSelected.map((item) => {
        const id = dGetId(item.dValue);

        return (
          <DTag
            key={id}
            dSize={size}
            dClosable={!item.dDisabled}
            onClose={() => {
              clearTidNotification.next();

              if (!disabled) {
                handleOptionClick(item);
              }
            }}
          >
            {(item[customSelected] as string) ?? item.dLabel}
          </DTag>
        );
      });
    } else {
      const select = getSelect(dMultiple, _select);

      if (!isNull(select)) {
        const id = dGetId(select);
        const option = findOption((o) => o.dValue && dGetId(o.dValue) === id, dOptions);
        if (option) {
          selectedLabel = option.dLabel;
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
    dOptions,
    dCustomSelected,
    dPrefix,
    size,
    dMaxSelectNum,
    dGetId,
    clearTidNotification,
    disabled,
    handleOptionClick,
    findOption,
  ]);

  const hasSelected = dMultiple ? (_select as T[]).length > 0 : !isNull(_select);

  const itemRender = useCallback(
    (item: DSelectOption<T>, renderProps) => {
      if (item.dChildren) {
        return (
          <ul
            key={`${dPrefix}select-group-${item.dLabel}`}
            className={getClassName(`${dPrefix}select__option-group`)}
            role="group"
            aria-labelledby={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
          >
            <li key={`${dPrefix}select-group-${item.dLabel}`} id={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`} role="presentation">
              <span className={`${dPrefix}select__option-content`}>{item.dLabel}</span>
            </li>
            {renderProps.children}
          </ul>
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const optionId = dGetId(item.dValue!);

      let isSelected = false;
      if (dMultiple) {
        const select = getSelect(dMultiple, _select);

        isSelected = select.findIndex((item) => dGetId(item) === optionId) !== -1;
      } else {
        const select = getSelect(dMultiple, _select);

        if (isNull(select)) {
          isSelected = false;
        } else {
          isSelected = dGetId(select) === optionId;
        }
      }

      return (
        <li
          {...renderProps}
          key={optionId}
          id={`${dPrefix}select-${uniqueId}-option-${optionId}`}
          className={getClassName(`${dPrefix}select__option`, {
            'is-selected': !dMultiple && isSelected,
            'is-focus': focusId === optionId,
            'is-disabled': item.dDisabled,
          })}
          role="option"
          title={(item[IS_CREATE] ? t('Create') + ' ' : '') + item.dLabel}
          aria-selected={isSelected}
          aria-disabled={item.dDisabled}
          onClick={
            item.dDisabled
              ? undefined
              : () => {
                  if (item[IS_CREATE]) {
                    const option = { ...item };
                    delete option[IS_CREATE];
                    onCreateOption?.(option as DSelectBaseOption<T>);
                  }
                  changeFocusOption(item);
                  handleOptionClick(item);
                }
          }
        >
          {item[IS_CREATE] ? (
            <DIcon viewBox="64 64 896 896" dTheme="primary">
              <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
              <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
            </DIcon>
          ) : dMultiple ? (
            <DCheckbox dModel={[isSelected]} dDisabled={item.dDisabled}></DCheckbox>
          ) : null}
          <span className={`${dPrefix}select__option-content`}>{dOptionRender(item as DSelectBaseOption<T>)}</span>
        </li>
      );
    },
    [_select, changeFocusOption, dGetId, dMultiple, dOptionRender, dPrefix, focusId, handleOptionClick, onCreateOption, t, uniqueId]
  );

  return (
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
          <DVirtualScroll
            className={`${dPrefix}select__list`}
            role="listbox"
            aria-multiselectable={dMultiple}
            aria-activedescendant={focusId ? `${dPrefix}select-${uniqueId}-option-${focusId}` : undefined}
            dFocusOption={focusOption}
            dHasSelected={hasSelected}
            dRendered={listRendered}
            dList={renderOptions}
            dNestedKey="dChildren"
            dCanSelectOption={canSelectOption}
            dCompareOption={compareOption}
            dItemRender={itemRender}
            dEmpty={
              <li key={`${dPrefix}select-empty`} className={`${dPrefix}select__empty`}>
                <span className={`${dPrefix}select__option-content`}>{t('No Data')}</span>
              </li>
            }
            dSize={264}
            dItemSize={32}
            dPaddingSize={4}
            onScrollEnd={onScrollBottom}
            onFocusChange={changeFocusOption}
          />
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
      dPopupClassName={getClassName(dPopupClassName, `${dPrefix}select-popup`)}
      onClear={handleClear}
      onSearch={handleSearch}
      onVisibleChange={changeVisible}
      onRendered={handleRendered}
    >
      {hasSelected && selectedNode}
    </DSelectBox>
  );
}
