import type { DId } from '../../utils/global';
import type { MultipleTreeNode } from '../tree/node';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DCascaderItem, DSearchItem } from './Cascader';
import type { Subject } from 'rxjs';

import { isUndefined } from 'lodash';
import React, { useEffect, useMemo, useRef } from 'react';

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
  onKeyDown$: Subject<'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level' | 'click'>;
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

  const handleKeyDown = useEventCallback((code: 'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level' | 'click') => {
    const focusItem = (item: DSearchItem<ID, T> | undefined) => {
      if (item) {
        onFocusChange(item);
      }
    };
    switch (code) {
      case 'next':
        focusItem(dVSRef.current?.scrollByStep(1));
        break;

      case 'prev':
        focusItem(dVSRef.current?.scrollByStep(-1));
        break;

      case 'first':
        focusItem(dVSRef.current?.scrollToStart());
        break;

      case 'last':
        focusItem(dVSRef.current?.scrollToEnd());
        break;

      case 'click':
        if (dFocusItem) {
          changeSelectByClick(dFocusItem);
        }
        break;

      default:
        break;
    }
  });

  useEffect(() => {
    const ob = onKeyDown$.subscribe({
      next: (code) => {
        handleKeyDown(code);
      },
    });

    return () => {
      ob.unsubscribe();
    };
  }, [handleKeyDown, onKeyDown$]);

  const vsPerformance = useMemo<DVirtualScrollPerformance<DSearchItem<ID, T>>>(
    () => ({
      dList,
      dItemSize: 32,
      dItemKey: (item) => item.value,
      dFocusable: (item) => item[TREE_NODE_KEY].enabled,
    }),
    [dList]
  );

  return (
    <DVirtualScroll
      {...vsPerformance}
      ref={dVSRef}
      dFillNode={<li></li>}
      dItemRender={(item, index, { iARIA }) => {
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
            {...iARIA}
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
      dFocusItem={dFocusItem}
      dSize={264}
      dPadding={4}
    >
      {({ vsScrollRef, vsRender, vsOnScroll }) => (
        <ul
          ref={vsScrollRef}
          id={dListId}
          className={`${dPrefix}cascader__list`}
          tabIndex={-1}
          role="listbox"
          aria-multiselectable={dMultiple}
          aria-activedescendant={isUndefined(dFocusItem) ? undefined : dGetItemId(dFocusItem.value)}
          onScroll={vsOnScroll}
        >
          {dList.length === 0 ? (
            <li className={`${dPrefix}cascader__empty`}>
              <div className={`${dPrefix}cascader__option-content`}>{t('No Data')}</div>
            </li>
          ) : (
            vsRender
          )}
        </ul>
      )}
    </DVirtualScroll>
  );
}
