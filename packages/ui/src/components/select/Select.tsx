import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';
import type { Draft } from 'immer';

import { isArray, isNull, isNumber, isString, isUndefined } from 'lodash';
import React, { useCallback, useRef, useEffect, useMemo, useState, useId } from 'react';
import { flushSync } from 'react-dom';
import { filter } from 'rxjs';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useAsync,
  useImmer,
  useTranslation,
  useRefCallback,
  useGeneralState,
} from '../../hooks';
import { getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';
import { DSelectBox } from '../_select-box';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';
import { DVirtualScroll } from '../virtual-scroll';

const IS_GROUP = Symbol();
const IS_GROUP_ITEM = Symbol();
const IS_EMPTY = Symbol();
const IS_CREATE = Symbol();

function getCanSelectItem<T>(value: DSelectOption<T>): DSelectBaseOption<T> | null {
  if (!value[IS_GROUP] && !value[IS_EMPTY] && !value.dDisabled) {
    if (!('dValue' in value)) {
      throw new Error('`dValue` is required if not a group option');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return value as any;
  }
  return null;
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
  dOptions?: Array<DSelectBaseOption<T>>;
  [index: string | symbol]: unknown;
}

export interface DSelectBaseProps<T> extends Omit<DSelectBoxProps, 'dExpanded' | 'dShowClear'> {
  dFormControlName?: string;
  dVisible?: [boolean, Updater<boolean>?];
  dOptions: Array<DSelectOption<T>>;
  dOptionRender?: (option: DSelectBaseOption<T>, index: number) => React.ReactNode;
  dGetId?: (value: T) => string;
  dClearable?: boolean;
  dCustomSearch?: {
    filter?: (value: string, option: DSelectBaseOption<T>) => boolean;
    sort?: (a: DSelectBaseOption<T>, b: DSelectBaseOption<T>) => number;
  };
  dPopupClassName?: string;
  onVisibleChange?: (visible: boolean) => void;
  onScrollBottom?: () => void;
  onCreateOption?: (value: string) => DSelectBaseOption<T> | null;
}

export interface DSelectSingleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T | null, Updater<T | null>?];
  dMultiple?: false;
  dCustomSelected?: (select: DSelectBaseOption<T>) => string;
  onModelChange?: (select: T | null) => void;
}

export interface DSelectMultipleProps<T> extends DSelectBaseProps<T> {
  dModel?: [T[], Updater<T[]>?];
  dMultiple: true;
  dMaxSelectNum?: number;
  dCustomSelected?: (selects: Array<DSelectBaseOption<T>>) => string[];
  onModelChange?: (selects: T[]) => void;
  onExceed?: () => void;
}

const DEFAULT_PROPS = {
  dOptionRender: (option: DSelectBaseOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DSelect<T>(props: DSelectSingleProps<T>): React.ReactElement;
export function DSelect<T>(props: DSelectMultipleProps<T>): React.ReactElement;
export function DSelect<T>(
  props: DSelectBaseProps<T> & {
    dModel?: [T | null | T[], Updater<T | null | T[]>?];
    dMultiple?: boolean;
    dMaxSelectNum?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dCustomSelected?: (select: any) => string | string[];
    onModelChange?: (select: T | null | T[]) => void;
    onExceed?: () => void;
  }
) {
  const {
    dModel,
    dFormControlName,
    dVisible,
    dOptions,
    dOptionRender = DEFAULT_PROPS.dOptionRender,
    dCustomSelected,
    dGetId = DEFAULT_PROPS.dGetId,
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
    children,
    onChange,
    onClick,
    onKeyDown,
    ...restProps
  } = useComponentConfig(DSelect.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const selectBoxRef = useRef<HTMLDivElement>(null);
  const [selectListEl, selectListRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef<{
    beforeSearch: { scrollTop: number; focusId: string | null } | null;
    clearTid: (() => void) | null;
    focusId: string | null;
  }>({
    beforeSearch: null,
    clearTid: null,
    focusId: null,
  });

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}select-${uniqueId}`;

  const [focusId, setfocusId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [createOptions, setCreateOptions] = useImmer<Array<DSelectBaseOption<T>>>([]);

  const [visible, _changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [select, changeSelect, { validateClassName, ariaAttribute, controlDisabled }] = useTwoWayBinding(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const hasSearchChar = searchValue.length > 0;

  const [options, allOptions] = useMemo(() => {
    const defaultFilterFn = (value: string, option: DSelectOption<T>) => {
      return option.dLabel.includes(value);
    };
    const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

    let createOption = hasSearchChar ? onCreateOption?.(searchValue) ?? null : null;
    if (createOption) {
      createOption = {
        ...createOption,
        [IS_GROUP]: false,
        [IS_GROUP_ITEM]: false,
        [IS_EMPTY]: false,
        [IS_CREATE]: true,
      };
    }

    const newOptions: Array<DSelectOption<T>> = [];
    const allOptions: Array<DSelectBaseOption<T>> = [];
    (createOptions as Array<DSelectOption<T>>).concat(dOptions).forEach((item: DSelectOption<T>) => {
      if (isUndefined(item.dOptions)) {
        if (createOption && dGetId(item.dValue as T) === dGetId(createOption.dValue)) {
          createOption = null;
        }
        const _item = Object.assign(
          {
            [IS_GROUP]: false,
            [IS_GROUP_ITEM]: false,
            [IS_EMPTY]: false,
          },
          item
        );
        allOptions.push(_item as DSelectBaseOption<T>);
        if (!hasSearchChar || filterFn(searchValue, item as DSelectBaseOption<T>)) {
          newOptions.push(_item);
        }
      } else {
        if (!hasSearchChar) {
          newOptions.push(
            Object.assign(
              {
                [IS_GROUP]: true,
                [IS_GROUP_ITEM]: false,
                [IS_EMPTY]: false,
              },
              item
            )
          );
        }

        let pushCount = 0;
        item.dOptions.forEach((groupItem) => {
          if (createOption && dGetId(groupItem.dValue) === dGetId(createOption.dValue)) {
            createOption = null;
          }
          const _item = Object.assign(
            {
              [IS_GROUP]: false,
              [IS_GROUP_ITEM]: item.dLabel,
              [IS_EMPTY]: false,
            },
            groupItem
          );
          allOptions.push(_item);
          if (!hasSearchChar || filterFn(searchValue, groupItem)) {
            newOptions.push(_item);
            pushCount += 1;
          }
        });
        if (pushCount === 0) {
          if (!hasSearchChar) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            newOptions.push({ [IS_GROUP]: false, [IS_GROUP_ITEM]: item.dLabel, [IS_EMPTY]: true } as any);
          }
        }
      }
    });

    const sortFn = dCustomSearch?.sort;
    if (sortFn && hasSearchChar) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      newOptions.sort(sortFn as any);
    }

    if (createOption) {
      allOptions.unshift(createOption);
      newOptions.unshift(createOption);
    }

    return [newOptions, allOptions];
  }, [createOptions, dCustomSearch, dGetId, dOptions, hasSearchChar, onCreateOption, searchValue]);

  const findCanSelectItemIndex = useCallback(
    (options: Array<DSelectOption<T>>, id?: string | null) => {
      id = id ?? dataRef.current.focusId;
      return options.findIndex((item) => {
        const _item = getCanSelectItem(item);
        if (_item) {
          return dGetId(_item.dValue) === id;
        }
        return false;
      });
    },
    [dGetId]
  );

  const changeVisible = useCallback(
    (visible: boolean) => {
      _changeVisible(visible);

      if (visible) {
        if (selectListEl) {
          if (isNull(dataRef.current.focusId)) {
            if (isNull(select) || (isArray(select) && select.length === 0)) {
              for (const [index, item] of options.entries()) {
                const _item = getCanSelectItem(item);
                if (_item) {
                  dataRef.current.focusId = dGetId(_item.dValue);
                  selectListEl.scrollTop = index * 32;
                  break;
                }
              }
            } else {
              dataRef.current.focusId = isArray(select) ? dGetId(select[0]) : dGetId(select);
              const index = findCanSelectItemIndex(options);
              asyncCapture.setTimeout(() => (selectListEl.scrollTop = index * 32), 20);
            }
            setfocusId(dataRef.current.focusId);
          }
        }
      }
    },
    [_changeVisible, asyncCapture, dGetId, findCanSelectItemIndex, options, select, selectListEl, setfocusId]
  );

  const handleOptionClick = useCallback(
    (e: { currentTarget?: HTMLElement; __dSwitch?: boolean }) => {
      dataRef.current.clearTid && dataRef.current.clearTid();

      const optionId = isUndefined(e.currentTarget) ? dataRef.current.focusId : (e.currentTarget.dataset['dOptionId'] as string);
      dataRef.current.focusId = optionId;
      setfocusId(optionId);
      const option = allOptions[findCanSelectItemIndex(allOptions, optionId)];

      if (option && !isUndefined(option.dValue)) {
        const createOption = () => {
          if (option[IS_CREATE]) {
            setCreateOptions((draft) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              draft.unshift({ ...option, [IS_CREATE]: false } as any);
            });
          }
        };
        if (dMultiple) {
          const __dSwitch = e.__dSwitch ?? true;

          changeSelect((draft) => {
            if (isArray(draft)) {
              const index = draft.findIndex((item) => dGetId(item as T) === optionId);
              if (index !== -1) {
                __dSwitch && draft.splice(index, 1);
              } else {
                if (isNumber(dMaxSelectNum) && draft.length === dMaxSelectNum) {
                  onExceed?.();
                } else {
                  createOption();
                  draft.push(option.dValue as Draft<T>);
                }
              }
            } else {
              throw new Error("Please pass Array when `dMultiple` is 'true'");
            }
          });
        } else {
          createOption();
          changeSelect(option.dValue);
        }
      }

      if (!dMultiple) {
        changeVisible(false);
        asyncCapture.requestAnimationFrame(() => {
          if (selectBoxRef.current) {
            selectBoxRef.current.focus({ preventScroll: true });
          }
        });
      }
    },
    [
      allOptions,
      asyncCapture,
      changeSelect,
      changeVisible,
      dGetId,
      dMaxSelectNum,
      dMultiple,
      findCanSelectItemIndex,
      onExceed,
      setCreateOptions,
    ]
  );

  const handleClick = useCallback(
    (e) => {
      onClick?.(e);

      dataRef.current.clearTid && dataRef.current.clearTid();
      changeVisible(!visible);
    },
    [changeVisible, onClick, visible]
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      onKeyDown?.(e);

      if (e.code === 'Space' || e.code === 'Enter') {
        if (!visible) {
          e.preventDefault();
          e.stopPropagation();
          changeVisible(true);
        }
      }
    },
    [changeVisible, onKeyDown, visible]
  );

  const handleClear = useCallback(() => {
    if (visible) {
      dataRef.current.clearTid && dataRef.current.clearTid();
      changeVisible(true);
    }

    if (dMultiple) {
      changeSelect([]);
    } else {
      changeSelect(null);
    }
  }, [visible, dMultiple, changeVisible, changeSelect]);

  const handleSearch = useCallback(
    (value: string) => {
      onSearch?.(value);

      if (value.length > 0) {
        if (isNull(dataRef.current.beforeSearch)) {
          if (selectListEl) {
            dataRef.current.beforeSearch = {
              scrollTop: selectListEl.scrollTop,
              focusId: dataRef.current.focusId,
            };
          }
        }
      }

      setSearchValue(value);
    },
    [onSearch, selectListEl, setSearchValue]
  );

  const customTransition = useCallback((popupEl: HTMLElement, targetEl: HTMLElement) => {
    const { top, left, transformOrigin } = getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 8);
    popupEl.style.width = targetEl.getBoundingClientRect().width + 'px';
    return {
      top,
      left,
      stateList: {
        'enter-from': { transform: 'scaleY(0.7)', opacity: '0' },
        'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
        'leave-active': { transition: 'transform 116ms ease-in, opacity 116ms ease-in', transformOrigin },
        'leave-to': { transform: 'scaleY(0.7)', opacity: '0' },
      },
    };
  }, []);

  //#region DidUpdate
  useEffect(() => {
    if (hasSearchChar) {
      if (selectListEl) {
        for (const [index, item] of options.entries()) {
          const _item = getCanSelectItem(item);
          if (_item) {
            dataRef.current.focusId = dGetId(_item.dValue);
            setfocusId(dataRef.current.focusId);

            selectListEl.scrollTop = index * 32;
            break;
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSearchChar]);

  useEffect(() => {
    if (!hasSearchChar && selectListEl && dataRef.current.beforeSearch) {
      const handle = () => {
        if (dataRef.current.beforeSearch) {
          dataRef.current.focusId = dataRef.current.beforeSearch.focusId;
          selectListEl.scrollTop = dataRef.current.beforeSearch.scrollTop;
          setfocusId(dataRef.current.focusId);
          dataRef.current.beforeSearch = null;
        }
      };
      if (selectListEl.scrollHeight === 8) {
        asyncCapture.requestAnimationFrame(() => asyncCapture.setTimeout(() => handle()));
      } else {
        handle();
      }
    }
  }, [asyncCapture, hasSearchChar, selectListEl, setfocusId]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (selectListEl && visible) {
      const changeFocusByKeydown = (down = true) => {
        if (!isNull(dataRef.current.focusId)) {
          let index = findCanSelectItemIndex(options);
          let option: DSelectOption<T> | undefined;
          const getOption = () => {
            const isEnd = (!down && index === 0) || (down && index === options.length - 1);
            index = isEnd ? index : down ? index + 1 : index - 1;
            const _option = (options[index] ? getCanSelectItem(options[index]) : null) as DSelectOption<T> | null;
            if (_option) {
              option = _option;
            } else {
              !isEnd && getOption();
            }
          };
          getOption();
          if (option && !isUndefined(option.dValue)) {
            dataRef.current.focusId = dGetId(option.dValue);
            const elTop = [index * 32 + 4, (index + 1) * 32 + 4];
            if (selectListEl.scrollTop > elTop[1]) {
              selectListEl.scrollTop = elTop[0] - 4;
            } else if (elTop[0] > selectListEl.scrollTop + selectListEl.clientHeight) {
              selectListEl.scrollTop = elTop[1] - selectListEl.clientHeight + 4;
            } else {
              if (down) {
                if (elTop[1] > selectListEl.scrollTop + selectListEl.clientHeight) {
                  selectListEl.scrollTop = elTop[1] - selectListEl.clientHeight + 4;
                }
              } else {
                if (selectListEl.scrollTop > elTop[0]) {
                  selectListEl.scrollTop = elTop[0] - 4;
                }
              }
            }

            setfocusId(dataRef.current.focusId);
          }
        }
      };

      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          switch (e.code) {
            case 'ArrowDown':
              e.preventDefault();
              changeFocusByKeydown();
              break;

            case 'ArrowUp':
              e.preventDefault();
              changeFocusByKeydown(false);
              break;

            case 'Home':
              e.preventDefault();
              for (const item of options) {
                const _item = getCanSelectItem(item);
                if (_item) {
                  selectListEl.scrollTop = 0;
                  dataRef.current.focusId = dGetId(_item.dValue);
                  setfocusId(dataRef.current.focusId);
                  break;
                }
              }
              break;

            case 'End':
              e.preventDefault();
              for (let index = options.length - 1; index >= 0; index--) {
                const item = getCanSelectItem(options[index]);
                if (item) {
                  selectListEl.scrollTop = 32 * index;
                  dataRef.current.focusId = dGetId(item.dValue);
                  setfocusId(dataRef.current.focusId);
                  break;
                }
              }
              break;

            case 'Enter':
              e.preventDefault();
              handleOptionClick({ __dSwitch: false });
              break;

            case 'Space':
              if (dMultiple) {
                e.preventDefault();
                handleOptionClick({ __dSwitch: true });
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
  }, [asyncCapture, dGetId, dMultiple, findCanSelectItemIndex, handleOptionClick, options, selectListEl, setfocusId, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (visible) {
      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearTid = asyncCapture.setTimeout(() => {
            flushSync(() => changeVisible(false));
          }, 20);
        },
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeVisible, visible]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (visible) {
      asyncGroup
        .fromEvent<KeyboardEvent>(window, 'keydown')
        .pipe(filter((e) => e.code === 'Escape'))
        .subscribe({
          next: () => {
            flushSync(() => changeVisible(false));
            asyncGroup.requestAnimationFrame(() => {
              if (selectBoxRef.current) {
                selectBoxRef.current.focus({ preventScroll: true });
              }
            });
          },
        });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, changeVisible, visible]);

  const [selectedNode, suffixNode] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    if (dMultiple) {
      if (isArray(select)) {
        const optionsSelected: Array<DSelectBaseOption<T>> = [];
        let tags: Array<{ label: string; id: string }> = [];
        const selectIds = select.map((item) => dGetId(item));
        allOptions.forEach((item) => {
          const _item = getCanSelectItem(item);
          if (_item) {
            const id = dGetId(_item.dValue);
            if (selectIds.includes(id)) {
              optionsSelected.push(_item);
              tags.push({ label: _item.dLabel, id });
            }
          }
        });
        if (dCustomSelected) {
          tags = (dCustomSelected(optionsSelected) as string[]).map((item, index) => ({ label: item, id: tags[index].id }));
        }

        suffixNode = (
          <DDropdown
            dTriggerNode={
              <DTag
                className={`${dPrefix}select__multiple-count`}
                dSize={size}
                dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === select.length ? 'danger' : undefined}
              >
                {(select as T[]).length} ...
              </DTag>
            }
            dCloseOnItemClick={false}
          >
            {tags.map((item) => (
              <DDropdownItem
                key={item.id}
                dId={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) {
                    dataRef.current.focusId = item.id;
                    handleOptionClick({});
                  }
                }}
              >
                {item.label}
              </DDropdownItem>
            ))}
          </DDropdown>
        );
        selectedNode = tags.map((item) => (
          <DTag
            key={item.id}
            dSize={size}
            dClosable
            onClose={(e) => {
              e.stopPropagation();
              if (!disabled) {
                dataRef.current.focusId = item.id;
                handleOptionClick({});
              }
            }}
          >
            {item.label}
          </DTag>
        ));
      }
    } else {
      if (!isNull(select)) {
        const optionSelected = allOptions[findCanSelectItemIndex(allOptions, dGetId(select as T))] as DSelectBaseOption<T> | undefined;
        if (optionSelected) {
          if (dCustomSelected) {
            selectedNode = dCustomSelected(optionSelected);
          } else {
            selectedNode = optionSelected.dLabel;
          }
        }
      }
    }
    return [selectedNode, suffixNode];
  }, [
    allOptions,
    dCustomSelected,
    dGetId,
    dMaxSelectNum,
    dMultiple,
    dPrefix,
    disabled,
    findCanSelectItemIndex,
    handleOptionClick,
    select,
    size,
  ]);
  //#endregion

  const hasSelect = isArray(select) ? select.length > 0 : !isNull(select);

  return (
    <DPopup
      className={getClassName(dPopupClassName, `${dPrefix}select-popup`)}
      dVisible={visible}
      dPopupContent={
        options.length === 0 && !dLoading ? (
          <span className={`${dPrefix}select__empty`}>{t('No Data')}</span>
        ) : (
          <>
            {dLoading && (
              <span
                className={getClassName(`${dPrefix}select__loading`, {
                  [`${dPrefix}select__loading--left`]: options.length === 0,
                })}
              >
                <DIcon viewBox="0 0 1024 1024" dSize={options.length === 0 ? 18 : 24} dSpin>
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                </DIcon>
              </span>
            )}
            <DVirtualScroll
              dListRender={(renderProps) => (
                <ul
                  {...renderProps}
                  ref={selectListRef}
                  id={`${dPrefix}select-${uniqueId}`}
                  className={`${dPrefix}select__list`}
                  tabIndex={-1}
                  role="listbox"
                  aria-multiselectable={dMultiple}
                  aria-activedescendant={isString(focusId) ? `${dPrefix}select-${uniqueId}-option-${focusId}` : undefined}
                  onClick={() => {
                    dataRef.current.clearTid && dataRef.current.clearTid();
                  }}
                ></ul>
              )}
              dList={options}
              dItemRender={(item, index, renderProps) => {
                if (item[IS_EMPTY]) {
                  return (
                    <li
                      {...renderProps}
                      key={`${dPrefix}select-${uniqueId}-empty-${item[IS_GROUP_ITEM]}`}
                      className={getClassName(`${dPrefix}select__option`, `${dPrefix}select__option--empty`)}
                    >
                      <span className={`${dPrefix}select__option-content`}>{t('No Data')}</span>
                    </li>
                  );
                }
                if (item[IS_GROUP]) {
                  return (
                    <li
                      {...renderProps}
                      key={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
                      className={getClassName(`${dPrefix}select__option`, `${dPrefix}select__option--group`)}
                      role="separator"
                      aria-orientation="horizontal"
                    >
                      <span className={`${dPrefix}select__option-content`}>{item.dLabel}</span>
                    </li>
                  );
                }

                const _item = item as DSelectBaseOption<T>;
                const optionId = dGetId(_item.dValue);
                let isSelected = false;
                if (isArray(select)) {
                  isSelected = select.findIndex((item) => dGetId(item) === optionId) !== -1;
                } else if (isNull(select)) {
                  isSelected = false;
                } else {
                  isSelected = dGetId(select) === optionId;
                }

                return (
                  <li
                    {...renderProps}
                    key={optionId}
                    id={`${dPrefix}select-${uniqueId}-option-${optionId}`}
                    className={getClassName(`${dPrefix}select__option`, {
                      [`${dPrefix}select__option--group-item`]: !hasSearchChar && _item[IS_GROUP_ITEM],
                      'is-selected': isSelected,
                      'is-focus': focusId === optionId,
                      'is-disabled': _item.dDisabled,
                    })}
                    tabIndex={-1}
                    role="option"
                    title={_item.dLabel}
                    aria-selected={isSelected}
                    aria-disabled={_item.dDisabled}
                    data-d-option-id={optionId}
                    onClick={_item.dDisabled ? undefined : handleOptionClick}
                  >
                    {_item[IS_CREATE] && (
                      <span className={`${dPrefix}select__option-add`}>
                        <DIcon viewBox="64 64 896 896" dTheme="primary">
                          <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                          <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                        </DIcon>
                      </span>
                    )}
                    <span className={`${dPrefix}select__option-content`}>{dOptionRender(_item, index)}</span>
                  </li>
                );
              }}
              dHeight={264}
              dItemHeight={32}
              onScrollEnd={onScrollBottom}
            />
          </>
        )
      }
      dTrigger={null}
      dArrow={false}
      dCustomPopup={customTransition}
      dTriggerRender={(renderProps) => (
        <DSelectBox
          {...restProps}
          {...renderProps}
          ref={selectBoxRef}
          id={_id}
          className={getClassName(className, `${dPrefix}select`, validateClassName, {
            [`${dPrefix}select--multiple`]: dMultiple,
          })}
          dSuffix={suffixNode}
          dExpanded={visible}
          dShowClear={dClearable && hasSelect}
          dLoading={dLoading}
          dDisabled={disabled}
          dSize={size}
          dAriaAttribute={ariaAttribute}
          onClear={handleClear}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
        >
          {hasSelect && selectedNode}
        </DSelectBox>
      )}
    />
  );
}
