import type { Updater } from '../../hooks/two-way-binding';
import type { DSelectBoxProps } from '../_select-box';
import type { Draft } from 'immer';

import { isArray, isNull, isNumber, isUndefined } from 'lodash';
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
import { generateComponentMate, getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';
import { DSelectBox } from '../_select-box';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';
import { DTag } from '../tag';

const IS_GROUP = Symbol();
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
  dChildren?: Array<DSelectBaseOption<T>>;
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

export type DSelectProps<T = unknown> = DSelectBaseProps<T> & {
  dModel?: [T | null | T[], Updater<T | null | T[]>?];
  dMultiple?: boolean;
  dMaxSelectNum?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dCustomSelected?: (select: any) => string | string[];
  onModelChange?: (select: T | null | T[]) => void;
  onExceed?: () => void;
};

const { COMPONENT_NAME } = generateComponentMate('DSelect');
const DEFAULT_PROPS = {
  dOptionRender: (option: DSelectBaseOption<unknown>) => option.dLabel,
  dGetId: (value: unknown) => String(value),
};
export function DSelect<T>(props: DSelectSingleProps<T>): React.ReactElement;
export function DSelect<T>(props: DSelectMultipleProps<T>): React.ReactElement;
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
    onClickCapture,
    onKeyDown,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSize, gDisabled } = useGeneralState();
  //#endregion

  //#region Ref
  const selectBoxRef = useRef<HTMLDivElement>(null);
  const [selectListEl, selectListRef] = useRefCallback<HTMLUListElement>();
  //#endregion

  const dataRef = useRef<{
    clearCloseTid: (() => void) | null;
    clearVisibleTid: (() => void) | null;
    hasInitFocus: boolean;
  }>({
    clearCloseTid: null,
    clearVisibleTid: null,
    hasInitFocus: false,
  });

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}select-${uniqueId}`;

  const [searchValue, setSearchValue] = useState('');

  const [visible, _changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);
  const [select, changeSelect, { validateClassName, controlDisabled }] = useTwoWayBinding(
    dMultiple ? [] : null,
    dModel,
    onModelChange,
    dFormControlName ? { formControlName: dFormControlName, id: _id } : undefined
  );
  dataRef.current.hasInitFocus = !(isNull(select) || (isArray(select) && select.length === 0));
  const [listRendered, setListRendered] = useState(visible);

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

  const hasSearchChar = searchValue.length > 0;

  const renderOptions = useMemo(() => {
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

    let renderOptions: Array<DSelectOption<T>> = [];

    dOptions.forEach((item: DSelectOption<T>) => {
      if (isUndefined(item.dChildren)) {
        if (createOption && dGetId(item.dValue as T) === dGetId(createOption.dValue)) {
          createOption = null;
        }
        if (!hasSearchChar || filterFn(searchValue, item as DSelectBaseOption<T>)) {
          renderOptions.push(item);
        }
      } else {
        const groupOptions: Array<DSelectBaseOption<T>> = [];
        item.dChildren.forEach((groupItem) => {
          if (createOption && dGetId(groupItem.dValue) === dGetId(createOption.dValue)) {
            createOption = null;
          }
          if (!hasSearchChar || filterFn(searchValue, groupItem)) {
            groupOptions.push(groupItem);
          }
        });

        if (!hasSearchChar) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortFn = dCustomSearch?.sort as any;
    if (sortFn && hasSearchChar) {
      renderOptions.sort(sortFn);
    }

    if (createOption) {
      renderOptions.unshift(createOption);
    }

    return renderOptions;
  }, [dCreateOption, dCustomSearch, dGetId, dOptions, hasSearchChar, searchValue]);

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

  const [focusOption, setFocusOption] = useState<DSelectOption<T> | null>(null);
  const focusId = focusOption && focusOption.dValue ? dGetId(focusOption.dValue) : null;

  const handleOptionClick = useCallback(
    (option: DSelectOption<T>, isSwitch?: boolean) => {
      if (canSelectOption(option) && option.dValue) {
        const optionId = dGetId(option.dValue);
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
    },
    [asyncCapture, canSelectOption, changeSelect, changeVisible, dGetId, dMaxSelectNum, dMultiple, onExceed]
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
    },
    [onSearch]
  );
  useEffect(() => {
    let option: DSelectOption<T> | null = null;

    if (searchValue.length === 0) {
      if (!(isNull(select) || (isArray(select) && select.length === 0))) {
        if (isArray(select)) {
          for (const id of select.map((item) => dGetId(item))) {
            option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
            if (option) {
              break;
            }
          }
        } else {
          const id = dGetId(select);
          option = findOption((o) => canSelectOption(o) && o.dValue && dGetId(o.dValue) === id);
        }
      }
    }

    if (isNull(option)) {
      option = findOption((o) => canSelectOption(o));
    }

    setFocusOption(option);

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
    setListRendered(true);
  }, []);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (selectListEl && listRendered && focusOption) {
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
  }, [asyncCapture, dMultiple, focusOption, handleOptionClick, listRendered, selectListEl]);

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

  const [selectedNode, suffixNode, selectedLabel] = useMemo(() => {
    let selectedNode: React.ReactNode = null;
    let suffixNode: React.ReactNode = null;
    let selectedLabel: string | undefined;
    if (dMultiple) {
      if (isArray(select)) {
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
                dataRef.current.clearVisibleTid && dataRef.current.clearVisibleTid();

                if (!disabled) {
                  handleOptionClick(item);
                }
              }}
            >
              {(item[customSelected] as string) ?? item.dLabel}
            </DTag>
          );
        });
      }
    } else {
      if (!isNull(select)) {
        const id = dGetId(select as T);
        const option = findOption((o) => o.dValue && dGetId(o.dValue) === id, dOptions);
        if (option) {
          selectedLabel = option.dLabel;
          if (dCustomSelected) {
            selectedNode = dCustomSelected(option);
          } else {
            selectedNode = option.dLabel;
          }
        }
      }
    }
    return [selectedNode, suffixNode, selectedLabel];
  }, [dCustomSelected, dGetId, dMaxSelectNum, dMultiple, dOptions, dPrefix, disabled, findOption, handleOptionClick, select, size]);

  const hasSelect = isArray(select) ? select.length > 0 : !isNull(select);

  const itemRender = useCallback(
    (item, index, renderProps) => {
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
                  setFocusOption(item);
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
            id={`${dPrefix}select-${uniqueId}`}
            className={`${dPrefix}select__list`}
            tabIndex={-1}
            role="listbox"
            aria-multiselectable={dMultiple}
            aria-activedescendant={focusId ? `${dPrefix}select-${uniqueId}-option-${focusId}` : undefined}
            dFocusOption={[focusOption, setFocusOption]}
            dHasInitFocus={dataRef.current.hasInitFocus}
            dRendered={listRendered}
            dListRef={selectListRef}
            dList={renderOptions}
            dCanSelectOption={canSelectOption}
            dCompareOption={compareOption}
            dItemRender={itemRender}
            dEmpty={
              <li key={`${dPrefix}select-empty`} className={`${dPrefix}select__option-empty`}>
                <span className={`${dPrefix}select__option-content`}>{t('No Data')}</span>
              </li>
            }
            dSize={264}
            dItemSize={32}
            dPaddingSize={4}
            onScrollEnd={onScrollBottom}
          />
        </>
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
          dContentTitle={selectedLabel}
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
