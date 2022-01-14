import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';
import type { Draft } from 'immer';

import { isArray, isNull, isNumber, isString, isUndefined } from 'lodash';
import React, { useCallback, useRef, useEffect, useMemo, useState, useId } from 'react';
import { flushSync } from 'react-dom';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useAsync,
  useTranslation,
  useRefCallback,
  useGeneralState,
} from '../../hooks';
import { getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';
import { DSelectBox } from '../_select-box';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';

const IS_GROUP = Symbol();
const IS_EMPTY = Symbol();
const IS_CREATE = Symbol();

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

export interface DSelectBaseProps<T> extends Omit<DSelectBoxProps, 'dSuffix' | 'dExpanded' | 'dShowClear'> {
  dFormControlName?: string;
  dVisible?: [boolean, Updater<boolean>?];
  dOptions: Array<DSelectOption<T>>;
  dOptionRender?: (option: DSelectBaseOption<T>, index: number) => React.ReactNode;
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
    onClickCapture,
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
    clearCloseTid: (() => void) | null;
    clearVisibleTid: (() => void) | null;
    isFirst: boolean;
  }>({
    beforeSearch: null,
    clearCloseTid: null,
    clearVisibleTid: null,
    isFirst: true,
  });

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}select-${uniqueId}`;

  const [focusId, setfocusId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const [visible, _changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );
  const [stopUpdate, setStopUpdate] = useState(!visible);

  const changeVisible = useCallback(
    (visible) => {
      _changeVisible(visible);
      setStopUpdate(true);
    },
    [_changeVisible]
  );

  const size = dSize ?? gSize;
  const disabled = dDisabled || gDisabled || controlDisabled;

  const hasSearchChar = searchValue.length > 0;

  const [renderOptions, flatOptions, flatAllOptions] = useMemo(() => {
    const defaultFilterFn = (value: string, option: DSelectOption<T>) => {
      return option.dLabel.includes(value);
    };
    const filterFn = isUndefined(dCustomSearch) ? defaultFilterFn : dCustomSearch.filter ?? defaultFilterFn;

    let createOption = hasSearchChar ? dCreateOption?.(searchValue) ?? null : null;
    if (createOption) {
      createOption = {
        ...createOption,
        [IS_CREATE]: true,
      };
    }

    const flatAllOptions: Array<DSelectBaseOption<T>> = [];
    let flatOptions: Array<DSelectOption<T>> = [];
    let renderOptions: Array<DSelectOption<T>> = [];

    dOptions.forEach((item: DSelectOption<T>) => {
      if (isUndefined(item.dOptions)) {
        if (createOption && dGetId(item.dValue as T) === dGetId(createOption.dValue)) {
          createOption = null;
        }
        flatAllOptions.push(item as DSelectBaseOption<T>);
        if (!hasSearchChar || filterFn(searchValue, item as DSelectBaseOption<T>)) {
          flatOptions.push(item);
          renderOptions.push(item);
        }
      } else {
        const groupOptions: Array<DSelectBaseOption<T>> = [];
        item.dOptions.forEach((groupItem) => {
          if (createOption && dGetId(groupItem.dValue) === dGetId(createOption.dValue)) {
            createOption = null;
          }
          flatAllOptions.push(groupItem);
          if (!hasSearchChar || filterFn(searchValue, groupItem)) {
            groupOptions.push(groupItem);
          }
        });

        if (!hasSearchChar) {
          flatOptions.push({
            [IS_GROUP]: true,
            dLabel: item.dLabel,
          });

          if (groupOptions.length === 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            groupOptions.push({ [IS_EMPTY]: item.dLabel } as any);
          }
          renderOptions.push({
            [IS_GROUP]: true,
            dLabel: item.dLabel,
            dOptions: groupOptions,
          });
        } else {
          renderOptions = renderOptions.concat(groupOptions);
        }
        flatOptions = flatOptions.concat(groupOptions);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortFn = dCustomSearch?.sort as any;
    if (sortFn && hasSearchChar) {
      renderOptions.sort(sortFn);
      flatOptions.sort(sortFn);
    }

    if (createOption) {
      flatAllOptions.unshift(createOption);
      flatOptions.unshift(createOption);
      renderOptions.unshift(createOption);
    }

    return [renderOptions, flatOptions, flatAllOptions];
  }, [dCreateOption, dCustomSearch, dGetId, dOptions, hasSearchChar, searchValue]);

  const canSelect = useCallback((option) => !option.dDisabled && !option[IS_EMPTY] && !option[IS_GROUP], []);
  const getCanSelectItem = useCallback(() => {
    let option: DSelectBaseOption<T> | null = null;
    for (const item of flatOptions) {
      if (canSelect(item)) {
        option = item as DSelectBaseOption<T>;
        break;
      }
    }
    return option as DSelectBaseOption<T> | null;
  }, [canSelect, flatOptions]);
  const getSelectItem = useCallback(
    (id: string) => {
      let count = -1;
      for (const item of flatOptions) {
        count += 1;

        if (id === dGetId(item.dValue as T)) {
          break;
        }
      }
      return count;
    },
    [dGetId, flatOptions]
  );

  const handleOptionClick = useCallback(
    (optionId: string | null, isSwitch?: boolean) => {
      if (optionId) {
        const option = flatAllOptions.find((option) => !option.dDisabled && dGetId(option.dValue) === optionId);

        if (option) {
          if (dMultiple) {
            isSwitch = isSwitch ?? true;

            changeSelect((draft) => {
              if (isArray(draft)) {
                const index = draft.findIndex((item) => dGetId(item as T) === optionId);
                if (index !== -1) {
                  isSwitch && draft.splice(index, 1);
                } else {
                  if (isNumber(dMaxSelectNum) && draft.length === dMaxSelectNum) {
                    onExceed?.();
                  } else {
                    draft.push(option.dValue as Draft<T>);
                  }
                }
              } else {
                throw new Error("Please pass Array when `dMultiple` is 'true'");
              }
            });
          } else {
            changeSelect(option.dValue);
          }
        }

        if (!dMultiple) {
          changeVisible(false);
          asyncCapture.setTimeout(() => {
            if (selectBoxRef.current) {
              selectBoxRef.current.focus({ preventScroll: true });
            }
          });
        }
      }
    },
    [asyncCapture, changeSelect, changeVisible, dGetId, dMaxSelectNum, dMultiple, flatAllOptions, onExceed]
  );

  const handleClickCapture = useCallback(
    (e) => {
      onClickCapture?.(e);

      dataRef.current.clearCloseTid && dataRef.current.clearCloseTid();
      if (!disabled) {
        dataRef.current.clearVisibleTid = asyncCapture.setTimeout(() => {
          changeVisible(!visible);
          dataRef.current.clearVisibleTid = null;
        }, 20);
      }
    },
    [asyncCapture, changeVisible, disabled, onClickCapture, visible]
  );

  const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>(
    (e) => {
      onKeyDown?.(e);

      if (!disabled) {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (!visible) {
            e.preventDefault();
            e.stopPropagation();
            changeVisible(true);
          }
        }
      }
    },
    [changeVisible, disabled, onKeyDown, visible]
  );

  const handleClear = useCallback(() => {
    dataRef.current.clearVisibleTid && dataRef.current.clearVisibleTid();

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
      if (value.length > 0 && selectListEl) {
        if (isNull(dataRef.current.beforeSearch)) {
          dataRef.current.beforeSearch = {
            focusId,
            scrollTop: selectListEl.scrollTop,
          };
        }
      }
    },
    [focusId, onSearch, selectListEl]
  );
  useEffect(() => {
    if (searchValue.length > 0 && selectListEl) {
      selectListEl.scrollTop = 0;
      const option = getCanSelectItem();
      if (option) {
        setfocusId(dGetId(option.dValue));
      }
    } else {
      if (dataRef.current.beforeSearch && selectListEl) {
        const scrollTop = dataRef.current.beforeSearch.scrollTop;
        const loop = () => {
          selectListEl.scrollTop = scrollTop;
          if (selectListEl.scrollTop !== scrollTop) {
            asyncCapture.setTimeout(() => loop());
          }
        };
        loop();
        setfocusId(dataRef.current.beforeSearch.focusId);
        dataRef.current.beforeSearch = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const customTransition = useCallback((popupEl: HTMLElement, targetEl: HTMLElement) => {
    const { top, left, transformOrigin } = getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 8);
    popupEl.style.width = Math.min(window.innerWidth - 20, targetEl.getBoundingClientRect().width) + 'px';
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

  const handlePopupClick = useCallback(() => {
    dataRef.current.clearCloseTid && dataRef.current.clearCloseTid();
  }, []);

  const handleRendered = useCallback(() => {
    setStopUpdate(false);

    if (dataRef.current.isFirst && selectListEl) {
      dataRef.current.isFirst = false;
      let _focusId: string | null = null;
      if (isNull(select) || (isArray(select) && select.length === 0)) {
        const option = getCanSelectItem();
        if (option) {
          _focusId = dGetId(option.dValue);
        }
      } else {
        _focusId = isArray(select) ? dGetId(select[0]) : dGetId(select);
        if (_focusId) {
          const count = getSelectItem(_focusId);
          selectListEl.scrollTop = count * 32;
        }
      }
      setfocusId(_focusId);
    }
  }, [dGetId, getCanSelectItem, getSelectItem, select, selectListEl]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (selectListEl && visible) {
      const changeFocusByKeydown = (down = true) => {
        if (!isNull(focusId)) {
          let count = getSelectItem(focusId);
          let option: DSelectOption<T> | undefined;
          const getOption = () => {
            if (!down && count === 0) {
              selectListEl.scrollTop = 0;
              return;
            }
            if (down && count === flatOptions.length - 1) {
              selectListEl.scrollTop = selectListEl.scrollHeight;
              return;
            }
            count = down ? count + 1 : count - 1;
            let _option: DSelectOption<T> | null = flatOptions[count];
            _option = _option && canSelect(_option) ? _option : null;
            if (_option) {
              option = _option;
            } else {
              getOption();
            }
          };
          getOption();
          if (option && !isUndefined(option.dValue)) {
            const elTop = [count * 32 + 4, (count + 1) * 32 + 4];
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

            setfocusId(dGetId(option.dValue));
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

              selectListEl.scrollTop = 0;
              for (const item of flatOptions) {
                if (canSelect(item)) {
                  setfocusId(dGetId(item.dValue as T));
                  break;
                }
              }
              break;

            case 'End':
              e.preventDefault();

              selectListEl.scrollTop = selectListEl.scrollHeight;
              for (let index = flatOptions.length - 1; index >= 0; index--) {
                if (canSelect(flatOptions[index])) {
                  setfocusId(dGetId(flatOptions[index].dValue as T));
                  break;
                }
              }
              break;

            case 'Enter':
              e.preventDefault();
              handleOptionClick(focusId, false);
              break;

            case 'Space':
              e.preventDefault();

              if (dMultiple) {
                handleOptionClick(focusId, true);
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
  }, [
    asyncCapture,
    canSelect,
    dGetId,
    dMultiple,
    flatOptions,
    focusId,
    getSelectItem,
    handleOptionClick,
    selectListEl,
    setfocusId,
    visible,
  ]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (visible) {
      asyncGroup.fromEvent(window, 'click', { capture: true }).subscribe({
        next: () => {
          dataRef.current.clearCloseTid = asyncCapture.setTimeout(() => {
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
      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          if (e.code === 'Escape') {
            flushSync(() => changeVisible(false));
            asyncGroup.setTimeout(() => {
              if (selectBoxRef.current) {
                selectBoxRef.current.focus({ preventScroll: true });
              }
            });
          } else if (e.code === 'Tab') {
            e.preventDefault();
          }
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
        let tags: Array<{ label: string; id: string; disabled?: boolean }> = [];
        const selectIds = select.map((item) => dGetId(item));
        flatAllOptions.forEach((item) => {
          const id = dGetId(item.dValue);
          if (selectIds.includes(id)) {
            optionsSelected.push(item);
            tags.push({ label: item.dLabel, id, disabled: item.dDisabled });
          }
        });
        if (dCustomSelected) {
          tags = (dCustomSelected(optionsSelected) as string[]).map((item, index) => ({
            label: item,
            id: tags[index].id,
            disabled: tags[index].disabled,
          }));
        }

        suffixNode = (
          <DDropdown
            dTriggerNode={
              <DTag
                className={`${dPrefix}select__multiple-count`}
                dSize={size}
                dTheme={isNumber(dMaxSelectNum) && dMaxSelectNum === select.length ? 'danger' : undefined}
                onClick={() => {
                  dataRef.current.clearVisibleTid && dataRef.current.clearVisibleTid();
                }}
              >
                {(select as T[]).length} ...
              </DTag>
            }
            dCloseOnItemClick={false}
            onClick={() => {
              dataRef.current.clearCloseTid && dataRef.current.clearCloseTid();
              dataRef.current.clearVisibleTid && dataRef.current.clearVisibleTid();
            }}
          >
            {tags.map((item) => (
              <DDropdownItem
                key={item.id}
                dId={item.id}
                dDisabled={item.disabled}
                onClick={() => {
                  if (!disabled && !item.disabled) {
                    handleOptionClick(item.id);
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
            dClosable={!item.disabled}
            onClose={() => {
              dataRef.current.clearVisibleTid && dataRef.current.clearVisibleTid();

              if (!disabled && !item.disabled) {
                handleOptionClick(item.id);
              }
            }}
          >
            {item.label}
          </DTag>
        ));
      }
    } else {
      if (!isNull(select)) {
        const id = dGetId(select as T);
        for (const option of flatAllOptions) {
          if (dGetId(option.dValue) === id) {
            if (dCustomSelected) {
              selectedNode = dCustomSelected(option);
            } else {
              selectedNode = option.dLabel;
            }
            break;
          }
        }
      }
    }
    return [selectedNode, suffixNode];
  }, [dCustomSelected, dGetId, dMaxSelectNum, dMultiple, dPrefix, disabled, flatAllOptions, handleOptionClick, select, size]);

  const hasSelect = isArray(select) ? select.length > 0 : !isNull(select);

  const itemRender = useCallback(
    (item, index, renderProps) => {
      if (item[IS_EMPTY]) {
        return (
          <li key={`${dPrefix}select-${uniqueId}-empty-${item[IS_EMPTY]}`} className={`${dPrefix}select__option-empty`}>
            <span className={`${dPrefix}select__option-content`}>{t('No Data')}</span>
          </li>
        );
      }
      if (item.dOptions) {
        return (
          <ul
            key={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
            className={getClassName(`${dPrefix}select__option-group`)}
            role="group"
            aria-labelledby={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
          >
            <li
              key={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
              id={`${dPrefix}select-${uniqueId}-group-${item.dLabel}`}
              role="presentation"
            >
              <span className={`${dPrefix}select__option-content`}>{item.dLabel}</span>
            </li>
            {renderProps.children}
          </ul>
        );
      }

      const optionId = dGetId(item.dValue);

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
            'is-selected': !dMultiple && isSelected,
            'is-focus': focusId === optionId,
            'is-disabled': item.dDisabled,
          })}
          tabIndex={-1}
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
                  setfocusId(optionId);
                  handleOptionClick(optionId);
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
          <span className={`${dPrefix}select__option-content`}>{dOptionRender(item, index)}</span>
        </li>
      );
    },
    [dGetId, dMultiple, dOptionRender, dPrefix, focusId, handleOptionClick, onCreateOption, select, t, uniqueId]
  );

  return (
    <DPopup
      className={getClassName(dPopupClassName, `${dPrefix}select-popup`)}
      dVisible={visible}
      dPopupContent={
        flatOptions.length === 0 && !dLoading ? (
          <span className={`${dPrefix}select__empty`}>{t('No Data')}</span>
        ) : (
          <>
            {dLoading && (
              <span
                className={getClassName(`${dPrefix}select__loading`, {
                  [`${dPrefix}select__loading--left`]: flatOptions.length === 0,
                })}
              >
                <DIcon viewBox="0 0 1024 1024" dSize={flatOptions.length === 0 ? 18 : 24} dSpin>
                  <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
                </DIcon>
              </span>
            )}
            <DVirtualScroll
              id={`${dPrefix}select-${uniqueId}`}
              className={`${dPrefix}select__list`}
              tabIndex={-1}
              role="listbox"
              aria-multiselectable={dMultiple}
              aria-activedescendant={isString(focusId) ? `${dPrefix}select-${uniqueId}-option-${focusId}` : undefined}
              dListRef={selectListRef}
              dList={renderOptions}
              dItemRender={itemRender}
              dNestedKey="dOptions"
              dStopUpdate={stopUpdate}
              dSize={264}
              dItemSize={32}
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
          onClear={handleClear}
          onSearch={handleSearch}
          onClickCapture={handleClickCapture}
          onKeyDown={handleKeyDown}
        >
          {hasSelect && selectedNode}
        </DSelectBox>
      )}
      onRendered={handleRendered}
      onClick={handlePopupClick}
    />
  );
}
