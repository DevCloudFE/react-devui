import type { DId } from '../../utils/global';
import type { MultipleTreeNode } from '../tree';
import type { DVirtualScrollRef } from '../virtual-scroll';
import type { DCascaderItem, DSearchItem } from './Cascader';
import type { Subject } from 'rxjs';

import React, { useEffect, useRef } from 'react';

import { useEventCallback, usePrefixConfig, useTranslation } from '../../hooks';
import { getClassName } from '../../utils';
import { DCheckbox } from '../checkbox';
import { DVirtualScroll } from '../virtual-scroll';
import { getText, TREE_NODE_KEY } from './utils';

interface DSearchListProps<ID extends DId, T> {
  dListId?: string;
  dGetItemId: (value: ID) => string;
  dList: DSearchItem<ID, T>[];
  dSelected: ID | null | Set<ID>;
  dFocusItem: DSearchItem<ID, T> | undefined;
  dCustomItem?: (item: T) => React.ReactNode;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  onSelectedChange: (value: ID | null | ID[]) => void;
  onClose: () => void;
  onFocusChange: (item: DSearchItem<ID, T>) => void;
  onKeyDown$: Subject<React.KeyboardEvent<HTMLInputElement>>;
}

export function DSearchList<ID extends DId, T extends DCascaderItem<ID>>(props: DSearchListProps<ID, T>): JSX.Element | null {
  const {
    dListId,
    dGetItemId,
    dList,
    dSelected,
    dFocusItem,
    dCustomItem,
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
  const dVSRef = useRef<DVirtualScrollRef<DSearchItem<ID, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const changeSelectByClick = useEventCallback((item: DSearchItem<ID, T>) => {
    if (dMultiple) {
      const checkeds = (item[TREE_NODE_KEY] as MultipleTreeNode<ID, T>).changeStatus(
        item[TREE_NODE_KEY].checked ? 'UNCHECKED' : 'CHECKED',
        dSelected as Set<ID>
      );
      onSelectedChange(Array.from(checkeds.keys()));
    } else {
      onSelectedChange(item[TREE_NODE_KEY].id);
      onClose();
    }
  });

  const handleKeyDown = useEventCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const focusItem = (item: DSearchItem<ID, T> | undefined) => {
      if (item) {
        onFocusChange(item);
      }
    };
    if (dFocusItem) {
      switch (e.code) {
        case 'Enter':
          e.preventDefault();
          changeSelectByClick(dFocusItem);
          break;

        case 'ArrowUp':
          e.preventDefault();
          focusItem(dVSRef.current?.scrollByStep(-1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          focusItem(dVSRef.current?.scrollByStep(1));
          break;

        case 'Home':
          e.preventDefault();
          focusItem(dVSRef.current?.scrollToStart());
          break;

        case 'End':
          e.preventDefault();
          focusItem(dVSRef.current?.scrollToEnd());
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
      className={`${dPrefix}cascader__list`}
      role="listbox"
      aria-multiselectable={dMultiple}
      aria-activedescendant={dFocusItem ? dGetItemId(dFocusItem.value) : undefined}
      dList={dList}
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
            id={dGetItemId(item.value)}
            className={getClassName(`${dPrefix}cascader__option`, {
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
            {dFocusVisible && dFocusItem?.value === item.value && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && <DCheckbox dModel={node.checked} dDisabled={node.disabled}></DCheckbox>}
            <div className={`${dPrefix}cascader__option-content`}>{dCustomItem ? dCustomItem(node.origin) : getText(node)}</div>
          </li>
        );
      }}
      dItemSize={32}
      dCompareItem={(a, b) => a.value === b.value}
      dFocusable={(item) => item[TREE_NODE_KEY].enabled}
      dFocusItem={dFocusItem}
      dSize={264}
      dPadding={4}
      dEmpty={
        <li className={`${dPrefix}cascader__empty`}>
          <div className={`${dPrefix}cascader__option-content`}>{t('No Data')}</div>
        </li>
      }
    />
  );
}
