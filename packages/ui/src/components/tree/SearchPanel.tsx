import type { DId } from '../../utils';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DTreeItem } from './Tree';
import type { AbstractTreeNode } from './abstract-node';

import { isUndefined } from 'lodash';
import React, { useMemo, useRef } from 'react';

import { useEventListener } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { DCheckbox } from '../checkbox';
import { DVirtualScroll } from '../virtual-scroll';
import { getText, TREE_NODE_KEY } from './utils';

export type DSearchItem<V extends DId, T> = DTreeItem<V> & { [TREE_NODE_KEY]: AbstractTreeNode<V, T> };

interface DSearchPanelProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dGetItemId: (value: V) => string;
  dList: DSearchItem<V, T>[];
  dFocusItem: DSearchItem<V, T> | undefined;
  dCustomItem?: (item: T) => React.ReactNode;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  dEventId: string;
  onFocusChange: (item: DSearchItem<V, T>) => void;
  onClickItem: (item: DSearchItem<V, T>) => void;
}

export function DSearchPanel<V extends DId, T extends DTreeItem<V>>(props: DSearchPanelProps<V, T>): JSX.Element | null {
  const {
    dGetItemId,
    dList,
    dFocusItem,
    dCustomItem,
    dMultiple,
    dOnlyLeafSelectable,
    dFocusVisible,
    dEventId,
    onFocusChange,
    onClickItem,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<DSearchItem<V, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const handleKeyDown = (key: DComboboxKeyboardSupportKey | 'click') => {
    const focusItem = (item: DSearchItem<V, T> | undefined) => {
      if (item) {
        onFocusChange(item);
      }
    };
    switch (key) {
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
          onClickItem(dFocusItem);
        }
        break;

      default:
        break;
    }
  };
  useEventListener(dEventId, handleKeyDown);

  const vsPerformance = useMemo<DVirtualScrollPerformance<DSearchItem<V, T>>>(
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
            className={getClassName(`${dPrefix}tree__search-option`, {
              'is-selected': !dMultiple && inSelected,
              'is-disabled': node.disabled,
            })}
            title={item.label}
            role="option"
            aria-selected={node.checked}
            aria-disabled={node.disabled}
            onClick={() => {
              onFocusChange(item);
              onClickItem(item);
            }}
          >
            {dFocusVisible && dFocusItem?.value === item.value && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && <DCheckbox dModel={node.checked} dDisabled={node.disabled}></DCheckbox>}
            <div className={`${dPrefix}tree__search-option-content`}>{dCustomItem ? dCustomItem(node.origin) : getText(node)}</div>
          </li>
        );
      }}
      dFocusItem={dFocusItem}
      dSize={264}
      dPadding={4}
    >
      {({ vsScrollRef, vsRender, vsOnScroll }) => (
        // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
        <ul
          {...restProps}
          ref={vsScrollRef}
          className={getClassName(restProps.className, `${dPrefix}tree__search-list`)}
          tabIndex={restProps.tabIndex ?? -1}
          role={restProps.role ?? 'listbox'}
          aria-multiselectable={restProps['aria-multiselectable'] ?? dMultiple}
          aria-activedescendant={restProps['aria-activedescendant'] ?? (isUndefined(dFocusItem) ? undefined : dGetItemId(dFocusItem.value))}
          onScroll={(e) => {
            restProps.onScroll?.(e);
            vsOnScroll(e);
          }}
        >
          {dList.length === 0 ? (
            <li className={`${dPrefix}tree__search-empty`}>
              <div className={`${dPrefix}tree__search-option-content`}>{t('No Data')}</div>
            </li>
          ) : (
            vsRender
          )}
        </ul>
      )}
    </DVirtualScroll>
  );
}
