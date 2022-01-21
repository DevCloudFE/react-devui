/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DSelectBaseOption, DSelectOption } from '../select';

import { isNull } from 'lodash';
import React, { useCallback, useState, useContext, useEffect, useLayoutEffect } from 'react';

import { useAsync, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DCascaderContext } from './Cascader';

interface SearchListProps<T> {
  dOptions: Array<DSelectOption<T[]>>;
  dOptionRender: (option: DSelectBaseOption<T[]>) => React.ReactNode;
  dSearchValue: string;
}

export function DSearchList<T>(props: SearchListProps<T>) {
  const { dOptions, dOptionRender, dSearchValue } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const {
    cascaderSelecteds,
    cascaderUniqueId,
    cascaderRendered,
    cascaderMultiple,
    cascaderGetId,
    onModelChange,
    onClose,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = useContext(DCascaderContext)!;
  //#endregion

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();

  const canSelectOption = useCallback((option) => !option.dDisabled, []);
  const compareOption = useCallback(
    (a: DSelectOption<T[]>, b: DSelectOption<T[]>) => {
      if (a.dValue && b.dValue) {
        const ids = b.dValue.map((v) => cascaderGetId(v));
        return a.dValue.every((v, i) => cascaderGetId(v) === ids[i]);
      }

      return false;
    },
    [cascaderGetId]
  );

  const getFocusOption = () => {
    let option: DSelectOption<T[]> | null = null;

    for (const o of dOptions) {
      if (canSelectOption(o)) {
        option = o;
        break;
      }
    }

    return option;
  };

  const [focusOption, setFocusOption] = useState(() => getFocusOption());
  const focusIds = focusOption && focusOption.dValue ? focusOption.dValue.map((v) => cascaderGetId(v)) : null;
  const changeFocusOption = useCallback((option) => {
    setFocusOption(option);
  }, []);

  const handleOptionClick = useCallback(
    (option: DSelectOption<T[]>, isSwitch?: boolean) => {
      if (canSelectOption(option) && option.dValue) {
        const optionIds = option.dValue.map((v) => cascaderGetId(v));
        if (cascaderMultiple) {
          const selecteds = [...(cascaderSelecteds as T[][])];
          isSwitch = isSwitch ?? true;
          const index = selecteds.findIndex((item) => item.every((v, i) => cascaderGetId(v) === optionIds[i]));
          if (index !== -1) {
            isSwitch && selecteds.splice(index, 1);
          } else {
            selecteds.push(option.dValue);
          }
          onModelChange(selecteds);
        } else {
          onModelChange(option.dValue);
        }
      }

      if (!cascaderMultiple) {
        onClose();
      }
    },
    [canSelectOption, cascaderGetId, cascaderMultiple, cascaderSelecteds, onClose, onModelChange]
  );

  useLayoutEffect(() => {
    setFocusOption(getFocusOption());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dSearchValue]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (cascaderRendered && focusOption) {
      asyncGroup.fromEvent<KeyboardEvent>(window, 'keydown').subscribe({
        next: (e) => {
          switch (e.code) {
            case 'Enter':
              e.preventDefault();
              handleOptionClick(focusOption, false);
              break;

            case 'Space':
              e.preventDefault();
              if (cascaderMultiple) {
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
  }, [asyncCapture, cascaderMultiple, cascaderRendered, focusOption, handleOptionClick]);

  const itemRender = useCallback(
    (item: DSelectOption<T[]>, renderProps) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const optionIds = item.dValue!.map((v) => cascaderGetId(v));
      const id = optionIds.join('$$');
      let isSelected = false;
      if (cascaderMultiple) {
        isSelected = (cascaderSelecteds as T[][]).findIndex((item) => item.every((v, i) => cascaderGetId(v) === optionIds[i])) !== -1;
      } else {
        if (isNull(cascaderSelecteds)) {
          isSelected = false;
        } else {
          isSelected = (cascaderSelecteds as T[]).every((v, i) => cascaderGetId(v) === optionIds[i]);
        }
      }
      let isFocus = false;
      if (focusIds) {
        isFocus = focusIds.every((id, index) => id === optionIds[index]);
      }

      return (
        <li
          {...renderProps}
          key={id}
          id={`${dPrefix}select-${cascaderUniqueId}-option-${id}`}
          className={getClassName(`${dPrefix}select__option`, {
            'is-selected': !cascaderMultiple && isSelected,
            'is-focus': isFocus,
            'is-disabled': item.dDisabled,
          })}
          role="option"
          title={item.dLabel}
          aria-selected={isSelected}
          aria-disabled={item.dDisabled}
          onClick={
            item.dDisabled
              ? undefined
              : () => {
                  changeFocusOption(item);
                  handleOptionClick(item);
                }
          }
        >
          {cascaderMultiple && <DCheckbox dModel={[isSelected]} dDisabled={item.dDisabled}></DCheckbox>}
          <span className={`${dPrefix}select__option-content`}>{dOptionRender(item as DSelectBaseOption<T[]>)}</span>
        </li>
      );
    },
    [
      cascaderGetId,
      cascaderMultiple,
      cascaderSelecteds,
      cascaderUniqueId,
      changeFocusOption,
      dOptionRender,
      dPrefix,
      focusIds,
      handleOptionClick,
    ]
  );

  return (
    <DVirtualScroll
      className={`${dPrefix}select__list`}
      role="listbox"
      aria-multiselectable={cascaderMultiple}
      aria-activedescendant={focusIds ? `${dPrefix}select-${cascaderUniqueId}-option-${focusIds.join('$$')}` : undefined}
      dFocusOption={focusOption}
      dRendered={cascaderRendered}
      dList={dOptions}
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
      onFocusChange={changeFocusOption}
    />
  );
}
