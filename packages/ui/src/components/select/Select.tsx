import type { DNestedChildren, DId, DSize } from '../../utils/global';
import type { DDropdownOption } from '../dropdown';
import type { DFormControl } from '../form';
import type { DVirtualScrollRef } from '../virtual-scroll';

import { isNull, isNumber, isUndefined } from 'lodash';
import React, { useState, useId, useCallback, useMemo, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralContext, useEventCallback, useDValue } from '../../hooks';
import { LoadingOutlined, PlusOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName, getNoTransformSize, getVerticalSidePosition } from '../../utils';
import { DSelectbox } from '../_selectbox';
import { DCheckbox } from '../checkbox';
import { DDropdown } from '../dropdown';
import { useFormControl } from '../form';
import { DTag } from '../tag';
import { DVirtualScroll } from '../virtual-scroll';

const IS_CREATE = Symbol();

export interface DSelectRef {
  updatePosition: () => void;
}

export interface DSelectOption<V extends DId> {
  label: string;
  value: V;
  disabled?: boolean;
}

export interface DSelectProps<V extends DId, T extends DSelectOption<V>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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
  dMaxSelectNum?: number;
  dCustomOption?: (option: DNestedChildren<T>) => React.ReactNode;
  dCustomSelected?: (select: DNestedChildren<T>) => string;
  dCustomSearch?: {
    filter?: (value: string, option: DNestedChildren<T>) => boolean;
    sort?: (a: DNestedChildren<T>, b: DNestedChildren<T>) => number;
  };
  dCreateOption?: (value: string) => DNestedChildren<T> | undefined;
  dPopupClassName?: string;
  dInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  dInputRef?: React.Ref<HTMLInputElement>;
  onModelChange?: (value: any, option: any) => void;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  onCreateOption?: (option: DNestedChildren<T>) => void;
  onScrollBottom?: () => void;
  onExceed?: () => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSelect' });
function Select<V extends DId, T extends DSelectOption<V>>(
  props: DSelectProps<V, T>,
  ref: React.ForwardedRef<DSelectRef>
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
    dMaxSelectNum,
    dCustomOption,
    dCustomSelected,
    dCustomSearch,
    dCreateOption,
    dPopupClassName,
    dInputProps,
    dInputRef,
    onModelChange,
    onVisibleChange,
    afterVisibleChange,
    onClear,
    onSearch,
    onCreateOption,
    onScrollBottom,
    onExceed,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<T>>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const listId = `${dPrefix}select-list-${uniqueId}`;
  const getOptionId = (val: V) => `${dPrefix}select-option-${val}-${uniqueId}`;
  const getGroupId = (val: V) => `${dPrefix}select-group-${val}-${uniqueId}`;

  const optionsMap = useMemo(() => {
    const options = new Map<V, T>();
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (const item of arr) {
        options.set(item.value, item);
        if (item.children) {
          reduceArr(item.children);
        }
      }
    };
    reduceArr(dOptions);
    return options;
  }, [dOptions]);

  const [searchValue, setSearchValue] = useState('');

  const canSelectOption = useCallback((option: DNestedChildren<T>) => !option.disabled && !option.children, []);

  const [focusVisible, setFocusVisible] = useState(false);

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
            (value as V[]).map((v) => optionsMap.get(v))
          );
        } else {
          onModelChange(value, isNull(value) ? null : optionsMap.get(value as V));
        }
      }
    },
    undefined,
    formControlInject
  );
  const select = useMemo(() => (dMultiple ? new Set(_select as V[]) : (_select as V | null)), [_select, dMultiple]);

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSearch = searchValue.length > 0;
  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

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
  const searchOptions = (() => {
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
        option.children.forEach((groupItem) => {
          if (createOption && groupItem.value === createOption.value) {
            createOption = undefined;
          }
          if (filterFn(searchValue, groupItem)) {
            groupOptions.push(groupItem);
          }
        });
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
  })();
  const options = hasSearch ? searchOptions : dOptions;

  const [_noSearchFocusOption, setNoSearchFocusOption] = useState<DNestedChildren<T> | undefined>();
  const noSearchFocusOption = (() => {
    let option: DNestedChildren<T> | undefined;

    if (_noSearchFocusOption) {
      option = optionsMap.get(_noSearchFocusOption.value);
      if (option && canSelectOption(option)) {
        return option;
      }
    }

    if (hasSelected) {
      option = findNested(dOptions, (o) => (canSelectOption(o) && dMultiple ? (select as Set<V>).has(o.value) : (select as V) === o.value));
    }

    if (isUndefined(option)) {
      option = findNested(dOptions, (o) => canSelectOption(o));
    }

    return option;
  })();

  const [_searchFocusOption, setSearchFocusOption] = useState<(T & { [IS_CREATE]?: boolean | undefined }) | undefined>();
  const searchFocusOption = (() => {
    if (_searchFocusOption && findNested(searchOptions, (o) => canSelectOption(o) && o.value === _searchFocusOption.value)) {
      return _searchFocusOption;
    }

    if (hasSearch) {
      return findNested(searchOptions, (o) => canSelectOption(o));
    }
  })();

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

  const changeSelectByClick = useEventCallback((val: V) => {
    if (dMultiple) {
      changeSelect((draft) => {
        const index = (draft as V[]).findIndex((v) => v === val);
        if (index !== -1) {
          (draft as V[]).splice(index, 1);
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

  const [selectedNode, suffixNode, selectedLabel] = (() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      const selectedOptions: T[] = (_select as V[]).map((v) => optionsMap.get(v)!);

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
            dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === (select as Set<V>).size ? 'danger' : undefined}
          >
            {(select as Set<V>).size}
          </DTag>
        </DDropdown>
      );
      selectedNode = selectedOptions.map((option) => (
        <DTag
          key={option.value}
          className={`${dPrefix}select__multiple-tag`}
          dSize={size}
          dClosable={!(option.disabled || disabled)}
          onClose={(e) => {
            e.stopPropagation();

            changeSelectByClick(option.value);
          }}
        >
          {dCustomSelected ? dCustomSelected(option) : option.label}
        </DTag>
      ));
    } else {
      if (!isNull(select)) {
        const option = optionsMap.get(select as V)!;
        selectedLabel = option.label;
        selectedNode = dCustomSelected ? dCustomSelected(option) : selectedLabel;
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  })();

  return (
    <DSelectbox
      {...restProps}
      ref={ref}
      dClassNamePrefix="select"
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
                changeSelectByClick(focusOption.value);
                break;

              default:
                break;
            }
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
            width,
            maxWidth: window.innerWidth - left - 20,
          },
          transformOrigin,
        };
      }}
      onVisibleChange={changeVisible}
      afterVisibleChange={afterVisibleChange}
      onFocusVisibleChange={setFocusVisible}
      onClear={() => {
        onClear?.();

        if (dMultiple) {
          changeSelect([]);
        } else {
          changeSelect(null);
        }
      }}
    >
      {({ sPopupRef, sStyle, sOnMouseDown, sOnMouseUp }) => (
        <div
          ref={sPopupRef}
          className={getClassName(dPopupClassName, `${dPrefix}select__popup`)}
          style={sStyle}
          onMouseDown={sOnMouseDown}
          onMouseUp={sOnMouseUp}
        >
          {dLoading && (
            <div
              className={getClassName(`${dPrefix}select__loading`, {
                [`${dPrefix}select__loading--empty`]: options.length === 0,
              })}
            >
              <LoadingOutlined dSize={options.length === 0 ? 18 : 24} dSpin />
            </div>
          )}
          <DVirtualScroll
            ref={dVSRef}
            id={listId}
            className={`${dPrefix}select__list`}
            role="listbox"
            aria-multiselectable={dMultiple}
            aria-activedescendant={isUndefined(focusOption) ? undefined : getOptionId(focusOption.value)}
            dList={options}
            dItemRender={(item, index, renderProps, parent) => {
              const { label: optionLabel, value: optionValue, disabled: optionDisabled, children } = item;

              const optionNode = dCustomOption ? dCustomOption(item) : optionLabel;

              if (children) {
                return (
                  <ul key={optionValue} className={`${dPrefix}select__option-group`} role="group" aria-labelledby={getGroupId(optionValue)}>
                    <li
                      key={optionValue}
                      id={getGroupId(optionValue)}
                      className={`${dPrefix}select__option-group-label`}
                      role="presentation"
                    >
                      <div className={`${dPrefix}select__option-content`}>{optionNode}</div>
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
                isSelected = (select as Set<V>).has(optionValue);
              } else {
                isSelected = (select as V | null) === optionValue;
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
                  {focusVisible && focusOption?.value === optionValue && <div className={`${dPrefix}focus-outline`}></div>}
                  {item[IS_CREATE] ? (
                    <PlusOutlined dTheme="primary" />
                  ) : dMultiple ? (
                    <DCheckbox dDisabled={optionDisabled} dModel={isSelected}></DCheckbox>
                  ) : null}
                  <div className={`${dPrefix}select__option-content`}>{optionNode}</div>
                </li>
              );
            }}
            dItemSize={(item) => {
              if (item.children && item.children.length === 0) {
                return 64;
              }
              return 32;
            }}
            dItemNested={(item) => item.children}
            dCompareItem={(a, b) => a.value === b.value}
            dFocusable={canSelectOption}
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
      )}
    </DSelectbox>
  );
}

export const DSelect: <V extends DId, T extends DSelectOption<V>>(
  props: DSelectProps<V, T> & { ref?: React.ForwardedRef<DSelectRef> }
) => ReturnType<typeof Select> = React.forwardRef(Select) as any;
