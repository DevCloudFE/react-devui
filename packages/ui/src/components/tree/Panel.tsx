import type { DId } from '../../utils';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DTreeItem } from './Tree';
import type { AbstractTreeNode } from './abstract-node';

import { isUndefined } from 'lodash';
import React, { useMemo, useRef } from 'react';

import { useEventListener } from '@react-devui/hooks';
import { CaretRightOutlined, LoadingOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { TTANSITION_DURING_BASE } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DCheckbox } from '../checkbox';
import { DVirtualScroll } from '../virtual-scroll';

export interface DPanelProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dGetGroupId: (value: V) => string;
  dGetItemId: (value: V) => string;
  dList: AbstractTreeNode<V, T>[];
  dExpandIds: Set<V>;
  dHeight: number;
  dPadding?: number;
  dFocusItem: AbstractTreeNode<V, T> | undefined;
  dCustomItem?: (item: T) => React.ReactNode;
  dShowLine?: boolean;
  dMultiple: boolean;
  dFocusVisible: boolean;
  dEventId: string;
  onFocusChange: (node: AbstractTreeNode<V, T>) => void;
  onExpandChange: (node: AbstractTreeNode<V, T>) => void;
  onClickItem: (node: AbstractTreeNode<V, T>) => void;
}

export function DPanel<V extends DId, T extends DTreeItem<V>>(props: DPanelProps<V, T>): JSX.Element | null {
  const {
    dGetGroupId,
    dGetItemId,
    dList,
    dExpandIds,
    dHeight,
    dPadding,
    dFocusItem,
    dCustomItem,
    dShowLine = false,
    dMultiple,
    dFocusVisible,
    dEventId,
    onClickItem,
    onFocusChange,
    onExpandChange,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<AbstractTreeNode<V, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const handleKeyDown = (key: DComboboxKeyboardSupportKey | 'click') => {
    const focusNode = (node?: AbstractTreeNode<V, T>) => {
      if (node) {
        onFocusChange(node);
      }
    };
    if (dFocusItem) {
      const isExpand = dExpandIds.has(dFocusItem.id);

      switch (key) {
        case 'next':
          focusNode(dVSRef.current?.scrollByStep(1));
          break;

        case 'prev':
          focusNode(dVSRef.current?.scrollByStep(-1));
          break;

        case 'first':
          focusNode(dVSRef.current?.scrollToStart());
          break;

        case 'last':
          focusNode(dVSRef.current?.scrollToEnd());
          break;

        case 'prev-level':
          if (!dFocusItem.isLeaf && isExpand) {
            onExpandChange(dFocusItem);
          } else if (dFocusItem.parent) {
            dVSRef.current?.scrollToItem(dFocusItem.parent);
            focusNode(dFocusItem.parent);
          }
          break;

        case 'next-level':
          if (!dFocusItem.isLeaf) {
            if (isExpand) {
              focusNode(dVSRef.current?.scrollByStep(1));
            } else {
              onExpandChange(dFocusItem);
            }
          }
          break;

        case 'click':
          onClickItem(dFocusItem);
          break;

        default:
          break;
      }
    }
  };
  useEventListener(dEventId, handleKeyDown);

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  const vsPerformance = useMemo<DVirtualScrollPerformance<AbstractTreeNode<V, T>>>(
    () => ({
      dList,
      dExpands: dExpandIds,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children,
        emptySize: 32,
        asItem: true,
      }),
      dItemKey: (item) => item.id,
      dFocusable: (item) => item.enabled,
    }),
    [dExpandIds, dList]
  );

  return (
    <DVirtualScroll
      {...vsPerformance}
      ref={dVSRef}
      dFillNode={<li></li>}
      dItemRender={(item, index, { iARIA, iChildren }) => {
        if (item.children) {
          const isExpand = dExpandIds.has(item.id);

          return (
            <li
              {...iARIA}
              key={item.id}
              className={getClassName(`${dPrefix}tree__option-group`, {
                [`${dPrefix}tree__option-group--root`]: iARIA['aria-level'] === 1,
              })}
              role="treeitem"
              aria-expanded={isExpand}
              aria-selected={item.checked}
              aria-disabled={item.disabled}
            >
              <div
                id={dGetGroupId(item.id)}
                className={getClassName(`${dPrefix}tree__option`, {
                  [`${dPrefix}tree__option--root`]: iARIA['aria-level'] === 1,
                  [`${dPrefix}tree__option--first`]: index === 0,
                  'is-selected': !dMultiple && item.checked,
                  'is-disabled': item.disabled,
                })}
                title={item.origin.label}
                onClick={() => {
                  onFocusChange(item);
                  onClickItem(item);
                }}
              >
                {dFocusVisible && item.id === dFocusItem?.id && <div className={`${dPrefix}focus-outline`}></div>}
                <div
                  className={`${dPrefix}tree__option-icon`}
                  onMouseDown={(e) => {
                    preventBlur(e);
                  }}
                  onMouseUp={(e) => {
                    preventBlur(e);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();

                    onExpandChange(item);
                  }}
                >
                  {item.origin.loading ? (
                    <LoadingOutlined dSpin />
                  ) : dShowLine ? (
                    isExpand ? (
                      <MinusSquareOutlined />
                    ) : (
                      <PlusSquareOutlined />
                    )
                  ) : (
                    <CaretRightOutlined className={`${dPrefix}tree__option-arrow`} dRotate={isExpand ? 90 : undefined} />
                  )}
                </div>
                {dMultiple && (
                  <DCheckbox
                    dModel={item.checked}
                    dDisabled={item.disabled}
                    dIndeterminate={item.indeterminate}
                    dInputProps={{ tabIndex: -1 }}
                  ></DCheckbox>
                )}
                <div className={`${dPrefix}tree__option-content`}>{dCustomItem ? dCustomItem(item.origin) : item.origin.label}</div>
              </div>
              {!item.origin.loading && (
                <DCollapseTransition
                  dSize={0}
                  dIn={isExpand}
                  dDuring={TTANSITION_DURING_BASE}
                  dStyles={{
                    entering: {
                      transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
                    },
                    leaving: {
                      transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
                    },
                    leaved: { display: 'none' },
                  }}
                >
                  {(collapseRef, collapseStyle) => (
                    <ul
                      ref={collapseRef}
                      className={`${dPrefix}tree__option-group`}
                      style={collapseStyle}
                      role="group"
                      aria-labelledby={dGetGroupId(item.id)}
                    >
                      {iChildren}
                    </ul>
                  )}
                </DCollapseTransition>
              )}
            </li>
          );
        }

        return (
          <li
            {...iARIA}
            key={item.id}
            id={dGetItemId(item.id)}
            className={getClassName(`${dPrefix}tree__option`, {
              [`${dPrefix}tree__option--root`]: iARIA['aria-level'] === 1,
              [`${dPrefix}tree__option--first`]: index === 0,
              'is-selected': !dMultiple && item.checked,
              'is-disabled': item.disabled,
            })}
            title={item.origin.label}
            role="treeitem"
            aria-selected={item.checked}
            aria-disabled={item.disabled}
            onClick={() => {
              onFocusChange(item);
              onClickItem(item);
            }}
          >
            {dFocusVisible && item.id === dFocusItem?.id && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && (
              <DCheckbox
                dModel={item.checked}
                dDisabled={item.disabled}
                dIndeterminate={item.indeterminate}
                dInputProps={{ tabIndex: -1 }}
              ></DCheckbox>
            )}
            <div className={`${dPrefix}tree__option-content`}>{dCustomItem ? dCustomItem(item.origin) : item.origin.label}</div>
          </li>
        );
      }}
      dFocusItem={dFocusItem}
      dSize={dHeight}
      dPadding={dPadding}
      dEmptyRender={() => (
        <li className={`${dPrefix}tree__empty`}>
          <div className={`${dPrefix}tree__option-content`}>{t('No Data')}</div>
        </li>
      )}
    >
      {({ vsScrollRef, vsRender, vsOnScroll }) => (
        // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
        <ul
          {...restProps}
          ref={vsScrollRef}
          className={getClassName(restProps.className, `${dPrefix}tree`, {
            [`${dPrefix}tree--line`]: dShowLine,
          })}
          tabIndex={restProps.tabIndex ?? -1}
          role={restProps.role ?? 'tree'}
          aria-multiselectable={restProps['aria-multiselectable'] ?? dMultiple}
          aria-activedescendant={restProps['aria-activedescendant'] ?? (isUndefined(dFocusItem) ? undefined : dGetItemId(dFocusItem.id))}
          onScroll={vsOnScroll}
        >
          {dList.length === 0 ? (
            <li className={`${dPrefix}tree__empty`} style={{ marginLeft: 0 }}>
              <div className={`${dPrefix}tree__option-content`}>{t('No Data')}</div>
            </li>
          ) : (
            vsRender
          )}
        </ul>
      )}
    </DVirtualScroll>
  );
}
