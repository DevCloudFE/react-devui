import type { DId } from '../../utils/global';
import type { DVirtualScrollRef } from '../_virtual-scroll';
import type { MultipleTreeNode, SingleTreeNode } from '../tree';
import type { DCascaderOption, DSearchOption } from './Cascader';
import type { Subject } from 'rxjs';

import React from 'react';
import { useEffect, useRef } from 'react';

import { useEventCallback, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';
import { getText, TREE_NODE_KEY } from './utils';

interface DSearchListProps<ID extends DId, T> {
  dListId?: string;
  dGetOptionId: (value: ID) => string;
  dOptions: DSearchOption<ID, T>[];
  dSelected: ID | null | ID[];
  dFocusOption: DSearchOption<ID, T> | undefined;
  dCustomOption?: (option: T) => React.ReactNode;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  onSelectedChange: (value: ID | null | ID[]) => void;
  onClose: () => void;
  onFocusChange: (option: DSearchOption<ID, T>) => void;
  onKeyDown$: Subject<React.KeyboardEvent<HTMLInputElement>>;
}

export function DSearchList<ID extends DId, T extends DCascaderOption<ID>>(props: DSearchListProps<ID, T>) {
  const {
    dListId,
    dGetOptionId,
    dOptions,
    dSelected,
    dFocusOption,
    dCustomOption,
    dMultiple,
    dOnlyLeafSelectable,
    dFocusVisible,
    onSelectedChange,
    onClose,
    onFocusChange,
    onKeyDown$,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<DSearchOption<ID, T>>>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const changeSelectByClick = useEventCallback((option: DSearchOption<ID, T>) => {
    if (dMultiple) {
      const checkeds = (option[TREE_NODE_KEY] as MultipleTreeNode<ID, T>).changeStatus(
        option[TREE_NODE_KEY].checked ? 'UNCHECKED' : 'CHECKED',
        dSelected as ID[]
      );
      onSelectedChange(checkeds);
    } else {
      (option[TREE_NODE_KEY] as SingleTreeNode<ID, T>).setChecked();
      onSelectedChange(option[TREE_NODE_KEY].id);
      onClose();
    }
  });

  const handleKeyDown = useEventCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const focusOption = (option: DSearchOption<ID, T> | undefined) => {
      if (option) {
        onFocusChange(option);
      }
    };
    if (dFocusOption) {
      switch (e.code) {
        case 'Enter':
          e.preventDefault();
          changeSelectByClick(dFocusOption);
          break;

        case 'ArrowUp':
          e.preventDefault();
          focusOption(dVSRef.current?.scrollByStep(-1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          focusOption(dVSRef.current?.scrollByStep(1));
          break;

        case 'Home':
          e.preventDefault();
          focusOption(dVSRef.current?.scrollToStart());
          break;

        case 'End':
          e.preventDefault();
          focusOption(dVSRef.current?.scrollToEnd());
          break;

        default:
          break;
      }
    }
  });

  useEffect(() => {
    const ob = onKeyDown$.subscribe({
      next: (e) => {
        handleKeyDown(e);
      },
    });

    return () => {
      ob.unsubscribe();
    };
  }, [handleKeyDown, onKeyDown$]);

  return (
    <DVirtualScroll
      ref={dVSRef}
      id={dListId}
      className={`${dPrefix}cascader-search-list`}
      role="listbox"
      aria-multiselectable={dMultiple}
      aria-activedescendant={dFocusOption ? dGetOptionId(dFocusOption.value) : undefined}
      dList={dOptions}
      dItemRender={(item, index, renderProps) => {
        const node = item[TREE_NODE_KEY];
        let inSelected = node.checked;
        if (!dOnlyLeafSelectable) {
          let _node = node;
          while (_node.parent) {
            _node = _node.parent;
            if (_node.id === item.value) {
              inSelected = true;
              break;
            }
          }
        }

        return (
          <li
            {...renderProps}
            key={item.value}
            id={dGetOptionId(item.value)}
            className={getClassName(`${dPrefix}cascader-search-list__option`, {
              'is-selected': !dMultiple && inSelected,
              'is-disabled': node.disabled,
            })}
            title={item.label}
            role="option"
            aria-selected={node.checked}
            aria-disabled={node.disabled}
            onClick={() => {
              onFocusChange(item);
              changeSelectByClick(item);
            }}
          >
            {dFocusVisible && dFocusOption?.value === item.value && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && <DCheckbox dModel={node.checked} dDisabled={node.disabled}></DCheckbox>}
            <div className={`${dPrefix}cascader-search-list__option-content`}>
              {dCustomOption ? dCustomOption(node.origin) : getText(node)}
            </div>
          </li>
        );
      }}
      dGetSize={() => 32}
      dCompareItem={(a, b) => a.value === b.value}
      dCanFocus={(item) => item[TREE_NODE_KEY].enabled}
      dFocusItem={dFocusOption}
      dSize={264}
      dPadding={4}
      dEmpty={
        <li className={`${dPrefix}cascader-search-list__empty`}>
          <div className={`${dPrefix}cascader-search-list__option-content`}>{t('No Data')}</div>
        </li>
      }
    />
  );
}
