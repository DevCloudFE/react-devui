import type { DUpdater } from '../../hooks/two-way-binding';
import type { DExtendsSelectBoxProps } from '../_select-box';

import { isNull, isNumber, isUndefined } from 'lodash';
import React, { useEffect, useState, useId, useCallback } from 'react';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useAsync,
  useTranslation,
  useGeneralState,
  useIsomorphicLayoutEffect,
  useEventCallback,
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

export interface DSelectOption<T> {
  dLabel: string;
  dValue?: T;
  dDisabled?: boolean;
  dChildren?: DSelectOption<T>[];
  [index: string | symbol]: unknown;
}

export interface DSelectBaseProps<T> extends React.HTMLAttributes<HTMLDivElement>, DExtendsSelectBoxProps {
  dFormControlName?: string;
  dVisible?: [boolean, DUpdater<boolean>?];
  dOptions: DSelectOption<T>[];
  dOptionRender?: (option: DSelectOption<T>) => React.ReactNode;
  dGetId?: (value: T) => string;
  dCreateOption?: (value: string) => DSelectOption<T> | null;
  dClearable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, option: DSelectOption<T>) => boolean;
    sort?: (a: DSelectOption<T>, b: DSelectOption<T>) => number;
  };
  onScrollBottom?: () => void;
  onCreateOption?: (option: DSelectOption<T>) => void;
}

export interface DSelectSingleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T | null, DUpdater<T | null>?];
  dMultiple?: false;
  dCustomSelected?: (select: DSelectOption<T>) => string;
  onModelChange?: (value: T | null) => void;
}

export interface DSelectMultipleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T[], DUpdater<T[]>?];
  dMultiple: true;
  dMaxSelectNum?: number;
  dCustomSelected?: (selects: DSelectOption<T>[]) => string[];
  onModelChange?: (values: T[]) => void;
  onExceed?: () => void;
}

export interface DSelectProps<T = unknown> extends DSelectBaseProps<T> {
  dModel?: DSelectSingleProps<T>['dModel'] | DSelectMultipleProps<T>['dModel'];
  dMultiple?: boolean;
  dMaxSelectNum?: number;
  dCustomSelected?: DSelectSingleProps<T>['dCustomSelected'] | DSelectMultipleProps<T>['dCustomSelected'];
  onModelChange?: DSelectSingleProps<T>['onModelChange'] | DSelectMultipleProps<T>['onModelChange'];
  onExceed?: () => void;
}

const { COMPONENT_NAME } = generateComponentMate('DSelect');
const DEFAULT_PROPS = {
  dOptionRender: (option: DSelectOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DSelect<T>(props: DSelectSingleProps<T>): JSX.Element | null;
export function DSelect<T>(props: DSelectMultipleProps<T>): JSX.Element | null;
export function DSelect<T>(props: DSelectProps<T>): JSX.Element | null;
export function DSelect<T>(props: DSelectProps<T>): JSX.Element | null {
  const {
    dFormControlName,
    dModel,
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
    onClear,
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

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}select-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);
  const [select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding<T | null | T[]>(
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
  const hasSelected = dMultiple ? (select as T[]).length > 0 : !isNull(select);

  const renderOptions = (() => {
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

    let renderOptions: DSelectOption<T>[] = [];

    dOptions.forEach((item: DSelectOption<T>) => {
      if (isUndefined(item.dChildren)) {
        if (createOption && dGetId(item.dValue as T) === dGetId(createOption.dValue as T)) {
          createOption = null;
        }
        if (!hasSearch || filterFn(searchValue, item)) {
          renderOptions.push(item);
        }
      } else {
        const groupOptions: DSelectOption<T>[] = [];
        item.dChildren.forEach((groupItem) => {
          if (createOption && dGetId(groupItem.dValue as T) === dGetId(createOption.dValue as T)) {
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

    const sortFn = dCustomSearch?.sort;
    if (sortFn && hasSearch) {
      renderOptions.sort(sortFn);
    }

    if (createOption) {
      renderOptions.unshift(createOption);
    }

    return renderOptions;
  })();

  const canSelectOption = (option: DSelectOption<T>) => !option.dDisabled && !option[IS_GROUP];
  const compareOption = (a: DSelectOption<T>, b: DSelectOption<T>) => {
    if (a.dValue && b.dValue) {
      return dGetId(a.dValue) === dGetId(b.dValue);
    }

    return false;
  };
  const findOption = (fn: (option: DSelectOption<T>) => unknown, options?: DSelectOption<T>[]): DSelectOption<T> | null => {
    options = options ?? renderOptions;
    let option: DSelectOption<T> | null = null;
    let stop = false;
    const reduceArr = (arr: DSelectOption<T>[]) => {
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
  };

  const getFocusOptionFn = () => {
    let option: DSelectOption<T> | null = null;

    if (!hasSearch) {
      if (dMultiple) {
        if ((select as T[]).length > 0) {
          for (const id of (select as T[]).map((item) => dGetId(item))) {
            option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
            if (option) {
              break;
            }
          }
        }
      } else {
        if (!isNull(select)) {
          const id = dGetId(select as T);
          option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
        }
      }
    }

    if (isNull(option)) {
      option = findOption((o) => canSelectOption(o));
    }

    return option;
  };
  const getFocusOption = useEventCallback(getFocusOptionFn);

  const [[searchFocusOption, noSearchFocusOption], setFocusOption] = useState(() => {
    const option = getFocusOptionFn();
    return [option, option];
  });
  useIsomorphicLayoutEffect(() => {
    if (hasSearch) {
      setFocusOption(([, noSearchFocusOption]) => [getFocusOption(), noSearchFocusOption]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);
  const focusOption = hasSearch ? searchFocusOption : noSearchFocusOption;
  const focusId = focusOption && focusOption.dValue ? dGetId(focusOption.dValue) : null;
  const changeFocusOption = useCallback(
    (option: DSelectOption<T> | null) => {
      setFocusOption(([searchFocusOption, noSearchFocusOption]) =>
        hasSearch ? [option, noSearchFocusOption] : [searchFocusOption, option]
      );
    },
    [hasSearch]
  );

  const handleOptionClick = useEventCallback((option: DSelectOption<T>, isSwitch?: boolean) => {
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
  });

  const [selectedNode, suffixNode, selectedLabel] = (() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      let optionsSelected: DSelectOption<T>[] = [];
      const customSelected = Symbol();
      const selectIds = (select as T[]).map((item) => dGetId(item));
      const reduceArr = (arr: DSelectOption<T>[]) => {
        for (const item of arr) {
          if (selectIds.length === 0) {
            break;
          }
          if (item.dChildren) {
            reduceArr(item.dChildren);
          } else if (item.dValue) {
            const index = selectIds.findIndex((id) => id === dGetId(item.dValue as T));
            if (index !== -1) {
              optionsSelected.push(item);
              selectIds.splice(index, 1);
            }
          }
        }
      };
      reduceArr(dOptions);

      if (dCustomSelected) {
        optionsSelected = (dCustomSelected as NonNullable<DSelectMultipleProps<T>['dCustomSelected']>)(optionsSelected).map((item, index) =>
          Object.assign(optionsSelected[index], { [customSelected]: item })
        );
      }

      suffixNode = (
        <DDropdown
          dTriggerNode={
            <DTag
              className={`${dPrefix}select__multiple-count`}
              dSize={size}
              dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === (select as T[]).length ? 'danger' : undefined}
            >
              {(select as T[]).length} ...
            </DTag>
          }
          dCloseOnItemClick={false}
        >
          {optionsSelected.map((item) => {
            const id = dGetId(item.dValue as T);

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
        const id = dGetId(item.dValue as T);

        return (
          <DTag
            key={id}
            dSize={size}
            dClosable={!item.dDisabled}
            onClose={() => {
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
      if (!isNull(select)) {
        const id = dGetId(select as T);
        const option = findOption((o) => o.dValue && dGetId(o.dValue) === id, dOptions);
        if (option) {
          selectedLabel = option.dLabel;
          if (dCustomSelected) {
            selectedNode = (dCustomSelected as NonNullable<DSelectSingleProps<T>['dCustomSelected']>)(option);
          } else {
            selectedNode = selectedLabel;
          }
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  })();

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (listRendered) {
      if (focusOption) {
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
      } else {
        asyncGroup
          .fromEvent<KeyboardEvent>(window, 'keydown')
          .pipe(filter((e) => e.code === 'ArrowDown'))
          .subscribe({
            next: (e) => {
              e.preventDefault();
              const option = getFocusOption();
              if (option) {
                changeFocusOption(option);
              }
            },
          });
      }
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeFocusOption, dMultiple, focusOption, getFocusOption, handleOptionClick, listRendered]);

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
            dItemRender={(item, renderProps) => {
              if (item.dChildren) {
                return (
                  <ul
                    key={`${dPrefix}select-group-${item.dLabel}`}
                    className={getClassName(`${dPrefix}select__option-group`)}
                    role="group"
                    aria-labelledby={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
                  >
                    <li
                      key={`${dPrefix}select-group-${item.dLabel}`}
                      id={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
                      role="presentation"
                    >
                      <span className={`${dPrefix}select__option-content`}>{item.dLabel}</span>
                    </li>
                    {renderProps.children}
                  </ul>
                );
              }

              const optionId = dGetId(item.dValue as T);

              let isSelected = false;
              if (dMultiple) {
                isSelected = (select as T[]).findIndex((item) => dGetId(item) === optionId) !== -1;
              } else {
                if (isNull(select)) {
                  isSelected = false;
                } else {
                  isSelected = dGetId(select as T) === optionId;
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
                            onCreateOption?.(option);
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
                  <span className={`${dPrefix}select__option-content`}>{dOptionRender(item)}</span>
                </li>
              );
            }}
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
      dPopupClassName={getClassName(dPopupClassName, `${dPrefix}select-popup`)}
      onClear={handleClear}
      onSearch={handleSearch}
      onVisibleChange={changeVisible}
      onRendered={() => {
        setRendered(true);
      }}
    >
      {hasSelected && selectedNode}
    </DSelectBox>
  );
}
