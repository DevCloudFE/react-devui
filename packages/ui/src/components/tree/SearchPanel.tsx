import type { DId } from '../../utils/types';
import type { ComboboxKeyDownRef } from '../_keyboard';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DTreeItem } from './Tree';
import type { AbstractTreeNode, TreeOrigin } from './abstract-node';

import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useMemo, useRef } from 'react';

import { useEventCallback } from '@react-devui/hooks';
import { getClassName } from '@react-devui/utils';

import { DCheckbox } from '../checkbox';
import { usePrefixConfig, useTranslation } from '../root';
import { DVirtualScroll } from '../virtual-scroll';
import { getText, TREE_NODE_KEY } from './utils';

export type DSearchItem<V extends DId, T extends TreeOrigin> = DTreeItem<V> & { [TREE_NODE_KEY]: AbstractTreeNode<V, T> };

interface DSearchPanelProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dGetItemId: (value: V) => string;
  dList: DSearchItem<V, T>[];
  dFocusItem: DSearchItem<V, T> | undefined;
  dCustomItem: ((item: T) => React.ReactNode) | undefined;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  onFocusChange: (item: DSearchItem<V, T>) => void;
  onClickItem: (item: DSearchItem<V, T>) => void;
}

function SearchPanel<V extends DId, T extends DTreeItem<V>>(
  props: DSearchPanelProps<V, T>,
  ref: React.ForwardedRef<ComboboxKeyDownRef>
): JSX.Element | null {
  const {
    dGetItemId,
    dList,
    dFocusItem,
    dCustomItem,
    dMultiple,
    dOnlyLeafSelectable,
    dFocusVisible,
    onFocusChange,
    onClickItem,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const vsRef = useRef<DVirtualScrollRef<DSearchItem<V, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const handleKeyDown = useEventCallback<ComboboxKeyDownRef>((key) => {
    const focusItem = (item: DSearchItem<V, T> | undefined) => {
      if (item) {
        onFocusChange(item);
      }
    };
    switch (key) {
      case 'next':
        focusItem(vsRef.current?.scrollToStep(1));
        break;

      case 'prev':
        focusItem(vsRef.current?.scrollToStep(-1));
        break;

      case 'first':
        focusItem(vsRef.current?.scrollToStart());
        break;

      case 'last':
        focusItem(vsRef.current?.scrollToEnd());
        break;

      case 'click':
        if (dFocusItem) {
          onClickItem(dFocusItem);
        }
        break;

      default:
        break;
    }
  });

  useImperativeHandle(ref, () => handleKeyDown, [handleKeyDown]);

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
      ref={vsRef}
      dFillNode={<li></li>}
      dItemRender={(item, index, { aria }) => {
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
            {...aria}
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
      {({ render, vsList }) =>
        render(
          // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
          <ul
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}tree__search-list`)}
            tabIndex={-1}
            role="listbox"
            aria-multiselectable={dMultiple}
            aria-activedescendant={isUndefined(dFocusItem) ? undefined : dGetItemId(dFocusItem.value)}
          >
            {dList.length === 0 ? (
              <li className={`${dPrefix}tree__search-empty`}>
                <div className={`${dPrefix}tree__search-option-content`}>{t('No Data')}</div>
              </li>
            ) : (
              vsList
            )}
          </ul>
        )
      }
    </DVirtualScroll>
  );
}

export const DSearchPanel: <V extends DId, T extends DTreeItem<V>>(
  props: DSearchPanelProps<V, T> & React.RefAttributes<ComboboxKeyDownRef>
) => ReturnType<typeof SearchPanel> = React.forwardRef(SearchPanel) as any;
