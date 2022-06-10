import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DNestedChildren, DId } from '../../utils/global';
import type { DExtendsSelectboxProps } from '../_selectbox';
import type { DVirtualScrollRef } from '../_virtual-scroll';
import type { DDropdownOption } from '../dropdown';

import { isArray, isNull, isNumber, isUndefined } from 'lodash';
import { useState, useId, useCallback, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useTranslation, useGeneralContext, useEventCallback } from '../../hooks';
import { LoadingOutlined, PlusOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName } from '../../utils';
import { DSelectbox } from '../_selectbox';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DDropdown } from '../dropdown';
import { DTag } from '../tag';

const IS_CREATE = Symbol();

export interface DSelectOption<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface DSelectBaseProps<V extends DId, T extends DSelectOption<V>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    DExtendsSelectboxProps {
  dOptions: DNestedChildren<T>[];
  dVisible?: [boolean, DUpdater<boolean>?];
  dCustomOption?: (option: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCreateOption?: (value: string) => DNestedChildren<T> | undefined;
  dClearable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, option: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dPopupClassName?: string;
  onScrollBottom?: () => void;
  onCreateOption?: (option: DNestedChildren<T>) => void;
}

export interface DSelectSingleProps<V extends DId, T extends DSelectOption<V>> extends DSelectBaseProps<V, T> {
  dModel?: [V | null, DUpdater<V | null>?];
  dMultiple?: false;
  onModelChange?: (value: V | null, option: DNestedChildren<T> | null) => void;
}

export interface DSelectMultipleProps<V extends DId, T extends DSelectOption<V>> extends DSelectBaseProps<V, T> {
  dModel?: [V[], DUpdater<V[]>?];
  dMultiple: true;
  dMaxSelectNum?: number;
  onModelChange?: (values: V[], options: DNestedChildren<T>[]) => void;
  onExceed?: () => void;
}

export interface DSelectProps<V extends DId, T extends DSelectOption<V>> extends DSelectBaseProps<V, T> {
  dModel?: [any, DUpdater<any>?];
  dMultiple?: boolean;
  dMaxSelectNum?: number;
  onModelChange?: (value: any, option: any) => void;
  onExceed?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSelect' });
export function DSelect<V extends DId, T extends DSelectOption<V>>(props: DSelectSingleProps<V, T>): JSX.Element | null;
export function DSelect<V extends DId, T extends DSelectOption<V>>(props: DSelectMultipleProps<V, T>): JSX.Element | null;
export function DSelect<V extends DId, T extends DSelectOption<V>>(props: DSelectProps<V, T>): JSX.Element | null;
export function DSelect<V extends DId, T extends DSelectOption<V>>(props: DSelectProps<V, T>): JSX.Element | null {
  const {
    dOptions,
    dModel,
    dVisible,
    dCustomOption,
    dCustomSelected,
    dCreateOption,
    dClearable = false,
    dCustomSearch,
    dMultiple = false,
    dMaxSelectNum,
    dPopupClassName,
    onModelChange,
    onScrollBottom,
    onCreateOption,
    onExceed,

    dFormControl,
    dLoading,
    dDisabled,
    dSize,
    onVisibleChange,
    onClear,
    onSearch,

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const uniqueId = useId();
  const listId = `${dPrefix}select-list-${uniqueId}`;
  const getOptionId = (val: V) => `${dPrefix}select-option-${val}-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}select-group-${val}-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const canSelectOption = useCallback((option: DNestedChildren<T>) => !option.disabled && !option.children, []);

  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);
  const [select, changeSelect] = useTwoWayBinding<V | null | V[]>(
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
                const index = value.findIndex((v) => v === item.value);
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
    { formControl: dFormControl?.control }
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as V[]).length > 0 : !isNull(select);

  const _filterFn = dCustomSearch?.filter;
  const filterFn = useCallback(
    (searchStr: string, option: T) => {
      const defaultFilterFn = (option: T) => {
        return option.label.includes(searchStr);
      };
      return _filterFn ? _filterFn(searchStr, option) : defaultFilterFn(option);
    },
    [_filterFn]
  );
  const sortFn = dCustomSearch?.sort;
  const searchOptions = useMemo(() => {
    if (!hasSearch) {
      return [];
    }

    let createOption = dCreateOption?.(searchValue);
    if (createOption) {
      createOption = {
        ...createOption,
        [IS_CREATE]: true,
      };
    }

    let searchOptions: (T & { [IS_CREATE]?: boolean })[] = [];

    dOptions.forEach((option) => {
      if (!option.children) {
        if (createOption && option.value === createOption.value) {
          createOption = undefined;
        }
        if (filterFn(searchValue, option)) {
          searchOptions.push(option);
        }
      } else {
        const groupOptions: T[] = [];
        if (option.children) {
          option.children.forEach((groupItem) => {
            if (createOption && groupItem.value === createOption.value) {
              createOption = undefined;
            }
            if (filterFn(searchValue, groupItem)) {
              groupOptions.push(groupItem);
            }
          });
        }

        searchOptions = searchOptions.concat(groupOptions);
      }
    });

    if (sortFn) {
      searchOptions.sort(sortFn);
    }

    if (createOption) {
      searchOptions.unshift(createOption);
    }

    return searchOptions;
  }, [dCreateOption, dOptions, filterFn, hasSearch, searchValue, sortFn]);

  const [_noSearchFocusOption, setNoSearchFocusOption] = useState<DNestedChildren<T> | undefined>();
  const noSearchFocusOption = useMemo(() => {
    if (_noSearchFocusOption && findNested(dOptions, (o) => canSelectOption(o) && o.value === _noSearchFocusOption.value)) {
      return _noSearchFocusOption;
    }

    let option: DNestedChildren<T> | undefined;

    if (dMultiple) {
      if ((select as V[]).length > 0) {
        option = findNested(dOptions, (o) => canSelectOption(o) && (select as V[]).includes(o.value));
      }
    } else {
      if (!isNull(select)) {
        option = findNested(dOptions, (o) => canSelectOption(o) && (select as V) === o.value);
      }
    }

    if (isUndefined(option)) {
      option = findNested(dOptions, (o) => canSelectOption(o));
    }

    return option;
  }, [_noSearchFocusOption, canSelectOption, dMultiple, dOptions, select]);

  const [_searchFocusOption, setSearchFocusOption] = useState<(T & { [IS_CREATE]?: boolean | undefined }) | undefined>();
  const searchFocusOption = useMemo(() => {
    if (_searchFocusOption && findNested(searchOptions, (o) => canSelectOption(o) && o.value === _searchFocusOption.value)) {
      return _searchFocusOption;
    }

    if (hasSearch) {
      return findNested(searchOptions, (o) => canSelectOption(o));
    }
  }, [_searchFocusOption, canSelectOption, hasSearch, searchOptions]);

  const focusOption = hasSearch ? searchFocusOption : noSearchFocusOption;
  const changeFocusOption = (option?: DNestedChildren<T>) => {
    if (!isUndefined(option)) {
      hasSearch ? setSearchFocusOption(option) : setNoSearchFocusOption(option);
    }
  };

  const createOption = (option?: DNestedChildren<T>) => {
    if (!isUndefined(option)) {
      const _option = { ...option };
      delete _option[IS_CREATE];
      onCreateOption?.(_option);
    }
  };

  const changeSelectByClick = useEventCallback((val: V, isSwitch?: boolean) => {
    if (dMultiple) {
      isSwitch = isSwitch ?? true;

      changeSelect((draft) => {
        const index = (draft as V[]).findIndex((v) => v === val);
        if (index !== -1) {
          isSwitch && (draft as V[]).splice(index, 1);
        } else {
          if (isNumber(dMaxSelectNum) && (draft as V[]).length === dMaxSelectNum) {
            onExceed?.();
          } else {
            (draft as V[]).push(val);
          }
        }
      });
    } else {
      changeSelect(val);
      changeVisible(false);
    }
  });

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selectedOptions: DNestedChildren<T>[] = [];
      let length = (select as V[]).length;
      const reduceArr = (arr: DNestedChildren<T>[]) => {
        for (const item of arr) {
          if (length === 0) {
            break;
          }

          if (item.children) {
            reduceArr(item.children);
          } else {
            const index = (select as V[]).findIndex((val) => val === item.value);
            if (index !== -1) {
              selectedOptions[index] = item;
              length -= 1;
            }
          }
        }
      };
      reduceArr(dOptions);

      suffixNode = (
        <DDropdown
          dOptions={selectedOptions.map<DDropdownOption<V>>((option) => {
            const { label: optionLabel, value: optionValue, disabled: optionDisabled } = option;
            const text = dCustomSelected ? dCustomSelected(option) : optionLabel;

            return {
              id: optionValue,
              label: text,
              type: 'item',
              disabled: optionDisabled,
            };
          })}
          dCloseOnClick={false}
          onOptionClick={(id: V) => {
            changeSelectByClick(id);
          }}
        >
          <DTag
            className={`${dPrefix}select__multiple-count`}
            dSize={size}
            dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === (select as V[]).length ? 'danger' : undefined}
          >
            {(select as V[]).length}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedOptions.map((option) => (
        <DTag
          key={option.value}
          className={`${dPrefix}select__multiple-tag`}
          dSize={size}
          dClosable={!(option.disabled || disabled)}
          onCloseClick={(e) => {
            e.stopPropagation();

            changeSelectByClick(option.value);
          }}
        >
          {dCustomSelected ? dCustomSelected(option) : option.label}
        </DTag>
      ));
    } else {
      if (!isNull(select)) {
        const option = findNested(dOptions, (o) => o.value === (select as V));
        if (option) {
          selectedLabel = option.label;
          selectedNode = dCustomSelected ? dCustomSelected(option) : selectedLabel;
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  }, [dCustomSelected, dMaxSelectNum, dMultiple, dOptions, dPrefix, disabled, changeSelectByClick, select, size]);

  return (
    <DSelectbox
      {...restProps}
      className={getClassName(className, `${dPrefix}select`)}
      dFormControl={dFormControl}
      dVisible={visible}
      dContent={hasSelected && selectedNode}
      dContentTitle={selectedLabel}
      dDisabled={disabled}
      dSuffix={suffixNode}
      dShowClear={hasSelected && dClearable}
      dLoading={dLoading}
      dSize={size}
      dInputProps={{
        'aria-controls': listId,
        onKeyDown: (e) => {
          if (visible && !isUndefined(focusOption)) {
            switch (e.code) {
              case 'ArrowUp':
                e.preventDefault();
                changeFocusOption(dVSRef.current?.scrollByStep(-1));
                break;

              case 'ArrowDown':
                e.preventDefault();
                changeFocusOption(dVSRef.current?.scrollByStep(1));
                break;

              case 'Home':
                e.preventDefault();
                changeFocusOption(dVSRef.current?.scrollToStart());
                break;

              case 'End':
                e.preventDefault();
                changeFocusOption(dVSRef.current?.scrollToEnd());
                break;

              case 'Enter':
                e.preventDefault();
                if (focusOption[IS_CREATE]) {
                  createOption(focusOption);
                }
                changeSelectByClick(focusOption.value, false);
                break;

              case 'Space':
                e.preventDefault();
                if (focusOption[IS_CREATE]) {
                  createOption(focusOption);
                }
                changeSelectByClick(focusOption.value, dMultiple);
                break;

              default:
                break;
            }
          }
        },
      }}
      onClear={() => {
        onClear?.();

        if (dMultiple) {
          changeSelect([]);
        } else {
          changeSelect(null);
        }
      }}
      onSearch={(value) => {
        onSearch?.(value);

        setSearchValue(value);
      }}
      onVisibleChange={changeVisible}
      onFocusVisibleChange={setIsFocusVisible}
    >
      {({ sStyle, sOnMouseDown, sOnMouseUp, ...restSProps }) => {
        return (
          <div
            {...restSProps}
            className={getClassName(dPopupClassName, `${dPrefix}select__popup`)}
            style={sStyle}
            onMouseDown={(e) => {
              sOnMouseDown(e);
            }}
            onMouseUp={(e) => {
              sOnMouseUp(e);
            }}
          >
            {dLoading && (
              <div
                className={getClassName(`${dPrefix}select__loading`, {
                  [`${dPrefix}select__loading--empty`]: dOptions.length === 0,
                })}
              >
                <LoadingOutlined dSize={dOptions.length === 0 ? 18 : 24} dSpin />
              </div>
            )}
            <DVirtualScroll
              ref={dVSRef}
              id={listId}
              className={`${dPrefix}select__list`}
              role="listbox"
              aria-multiselectable={dMultiple}
              aria-activedescendant={isUndefined(focusOption) ? undefined : getOptionId(focusOption.value)}
              dList={hasSearch ? searchOptions : dOptions}
              dItemRender={(item, index, renderProps, parent) => {
                const { label: optionLabel, value: optionValue, disabled: optionDisabled, children } = item;

                if (children) {
                  return (
                    <ul
                      key={optionValue}
                      className={`${dPrefix}select__option-group`}
                      role="group"
                      aria-labelledby={getGroupId(optionValue)}
                    >
                      <li
                        key={optionValue}
                        id={getGroupId(optionValue)}
                        className={`${dPrefix}select__option-group-label`}
                        role="presentation"
                      >
                        <div className={`${dPrefix}select__option-content`}>{optionLabel}</div>
                      </li>
                      {children.length === 0 ? (
                        <li className={`${dPrefix}select__empty`} style={{ paddingLeft: 12 + 8 }}>
                          <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                        </li>
                      ) : (
                        renderProps.children
                      )}
                    </ul>
                  );
                }

                let isSelected = false;
                if (dMultiple) {
                  isSelected = (select as V[]).findIndex((v) => v === optionValue) !== -1;
                } else {
                  if (isNull(select)) {
                    isSelected = false;
                  } else {
                    isSelected = (select as V) === optionValue;
                  }
                }

                return (
                  <li
                    {...renderProps}
                    key={optionValue}
                    id={getOptionId(optionValue)}
                    className={getClassName(`${dPrefix}select__option`, {
                      'is-selected': !dMultiple && isSelected,
                      'is-disabled': optionDisabled,
                    })}
                    style={{ paddingLeft: parent.length === 0 ? undefined : 12 + 8 }}
                    title={(item[IS_CREATE] ? t('Create') + ' ' : '') + optionLabel}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={optionDisabled}
                    onClick={() => {
                      if (!optionDisabled) {
                        if (item[IS_CREATE]) {
                          createOption(item);
                        }
                        changeFocusOption(item);
                        changeSelectByClick(optionValue);
                      }
                    }}
                  >
                    {isFocusVisible && focusOption?.value === optionValue && <div className={`${dPrefix}focus-outline`}></div>}
                    {item[IS_CREATE] ? (
                      <PlusOutlined dTheme="primary" />
                    ) : dMultiple ? (
                      <DCheckbox dDisabled={optionDisabled} dModel={[isSelected]}></DCheckbox>
                    ) : null}
                    <div className={`${dPrefix}select__option-content`}>{dCustomOption ? dCustomOption(item) : optionLabel}</div>
                  </li>
                );
              }}
              dGetSize={(item) => {
                if (item.children && item.children.length === 0) {
                  return 64;
                }
                return 32;
              }}
              dGetChildren={(item) => item.children}
              dCompareItem={(a, b) => a.value === b.value}
              dCanFocus={canSelectOption}
              dFocusItem={focusOption}
              dSize={264}
              dPadding={4}
              dEmpty={
                <li className={`${dPrefix}select__empty`}>
                  <div className={`${dPrefix}select__option-content`}>{t('No Data')}</div>
                </li>
              }
              onScrollEnd={onScrollBottom}
            />
          </div>
        );
      }}
    </DSelectbox>
  );
}
