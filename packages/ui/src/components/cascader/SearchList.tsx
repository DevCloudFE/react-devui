import type { DSelectOption } from '../select';
import type { AbstractTreeNode, MultipleTreeNode, SingleTreeNode } from '../tree';
import type { DCascaderContextData, DCascaderOption } from './Cascader';

import React, { useCallback, useState, useContext, useEffect } from 'react';
import { filter } from 'rxjs';

import { useAsync, useIsomorphicLayoutEffect, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { DCascaderContext } from './Cascader';
import { ID_SEPARATOR, TREE_NODE_KEY } from './utils';

interface SearchListProps<T> {
  dOptions: DSelectOption<T[]>[];
  dOptionRender: (option: DSelectOption<T[]>) => React.ReactNode;
  dSearchValue: string;
}

export function DSearchList<T>(props: SearchListProps<T>) {
  const { dOptions, dOptionRender, dSearchValue } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gSelecteds, gUniqueId, gRendered, gMultiple, gOnlyLeafSelectable, gGetId, gOnModelChange, gOnClose } = useContext(
    DCascaderContext
  ) as DCascaderContextData<T>;
  //#endregion

  const [t] = useTranslation('Common');
  const asyncCapture = useAsync();

  const canSelectOption = useCallback((option) => option[TREE_NODE_KEY].enabled, []);
  const compareOption = useCallback((a, b) => {
    return a[TREE_NODE_KEY].id.join(ID_SEPARATOR) === b[TREE_NODE_KEY].id.join(ID_SEPARATOR);
  }, []);

  const getFocusOption = useCallback(() => {
    let option: DSelectOption<T[]> | null = null;

    for (const o of dOptions) {
      if (canSelectOption(o)) {
        option = o;
        break;
      }
    }

    return option;
  }, [canSelectOption, dOptions]);

  const [focusOption, setFocusOption] = useState(() => getFocusOption());
  const focusIds = focusOption && focusOption.dValue ? focusOption.dValue.map((v) => gGetId(v)) : null;
  const changeFocusOption = useCallback((option) => {
    setFocusOption(option);
  }, []);

  const handleOptionClick = useCallback(
    (option: DSelectOption<T[]>, isSwitch?: boolean) => {
      if (canSelectOption(option) && option.dValue) {
        if (gMultiple) {
          isSwitch = isSwitch ?? true;
          const node = option[TREE_NODE_KEY] as MultipleTreeNode<T, DCascaderOption<T>>;

          const checkeds = node.changeStatus(isSwitch ? (node.checked ? 'UNCHECKED' : 'CHECKED') : 'CHECKED', gSelecteds as T[][]);
          gOnModelChange(checkeds);
        } else {
          const checkeds = (option[TREE_NODE_KEY] as SingleTreeNode<T, DCascaderOption<T>>).setChecked();
          gOnModelChange(checkeds);
        }
      }

      if (!gMultiple) {
        gOnClose();
      }
    },
    [canSelectOption, gMultiple, gSelecteds, gOnClose, gOnModelChange]
  );

  useIsomorphicLayoutEffect(() => {
    setFocusOption(getFocusOption());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dSearchValue]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (gRendered) {
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
                if (gMultiple) {
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
                setFocusOption(option);
              }
            },
          });
      }
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, gMultiple, gRendered, focusOption, getFocusOption, handleOptionClick]);

  const itemRender = useCallback(
    (item: DSelectOption<T[]>, renderProps) => {
      const node = item[TREE_NODE_KEY] as AbstractTreeNode<T, DCascaderOption<T>>;
      const optionIds = node.id;
      const id = optionIds.join(ID_SEPARATOR);
      let isFocus = false;
      if (focusIds) {
        isFocus = id === focusIds.join(ID_SEPARATOR);
      }

      return (
        <li
          {...renderProps}
          key={id}
          id={`${dPrefix}select-${gUniqueId}-option-${id}`}
          className={getClassName(`${dPrefix}select__option`, {
            'is-selected':
              !gMultiple && (gOnlyLeafSelectable ? node.checked : node.checked && node.value.length === (gSelecteds as T[]).length),
            'is-focus': isFocus,
            'is-disabled': node.disabled,
          })}
          role="option"
          title={item.dLabel}
          aria-selected={node.checked}
          aria-disabled={node.disabled}
          onClick={
            node.disabled
              ? undefined
              : () => {
                  changeFocusOption(item);
                  handleOptionClick(item);
                }
          }
        >
          {gMultiple && <DCheckbox dModel={[node.checked]} dDisabled={node.disabled}></DCheckbox>}
          <span className={`${dPrefix}select__option-content`}>{dOptionRender(item as DSelectOption<T[]>)}</span>
        </li>
      );
    },
    [gMultiple, gOnlyLeafSelectable, gSelecteds, gUniqueId, changeFocusOption, dOptionRender, dPrefix, focusIds, handleOptionClick]
  );

  return (
    <DVirtualScroll
      className={`${dPrefix}select__list`}
      role="listbox"
      aria-multiselectable={gMultiple}
      aria-activedescendant={focusIds ? `${dPrefix}select-${gUniqueId}-option-${focusIds.join(ID_SEPARATOR)}` : undefined}
      dFocusOption={focusOption}
      dRendered={gRendered}
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
