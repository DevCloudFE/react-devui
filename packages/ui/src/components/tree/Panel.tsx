import type { DId } from '../../utils/types';
import type { ComboboxKeyDownRef } from '../_keyboard';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DTreeItem } from './Tree';
import type { AbstractTreeNode } from './abstract-node';

import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useMemo, useRef } from 'react';

import { useEventCallback } from '@react-devui/hooks';
import { CaretRightOutlined, LoadingOutlined, MinusSquareOutlined, PlusSquareOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { cloneHTMLElement, TTANSITION_DURING_BASE } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DCheckbox } from '../checkbox';
import { usePrefixConfig, useTranslation } from '../root';
import { DVirtualScroll } from '../virtual-scroll';

export interface DPanelProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dGetGroupId: (value: V) => string;
  dGetItemId: (value: V) => string;
  dList: AbstractTreeNode<V, T>[];
  dExpandIds: Set<V>;
  dHeight: number;
  dPadding: number | undefined;
  dFocusItem: AbstractTreeNode<V, T> | undefined;
  dCustomItem: ((item: T) => React.ReactNode) | undefined;
  dShowLine: boolean;
  dMultiple: boolean;
  dFocusVisible: boolean;
  onFocusChange: (node: AbstractTreeNode<V, T>) => void;
  onExpandChange: (node: AbstractTreeNode<V, T>) => void;
  onClickItem: (node: AbstractTreeNode<V, T>) => void;
}

function Panel<V extends DId, T extends DTreeItem<V>>(
  props: DPanelProps<V, T>,
  ref: React.ForwardedRef<ComboboxKeyDownRef>
): JSX.Element | null {
  const {
    dGetGroupId,
    dGetItemId,
    dList,
    dExpandIds,
    dHeight,
    dPadding,
    dFocusItem,
    dCustomItem,
    dShowLine,
    dMultiple,
    dFocusVisible,
    onClickItem,
    onFocusChange,
    onExpandChange,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const vsRef = useRef<DVirtualScrollRef<AbstractTreeNode<V, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const handleKeyDown = useEventCallback<ComboboxKeyDownRef>((key) => {
    const focusNode = (node?: AbstractTreeNode<V, T>) => {
      if (node) {
        onFocusChange(node);
      }
    };
    if (dFocusItem) {
      const isExpand = dExpandIds.has(dFocusItem.id);

      switch (key) {
        case 'next':
          focusNode(vsRef.current?.scrollToStep(1));
          break;

        case 'prev':
          focusNode(vsRef.current?.scrollToStep(-1));
          break;

        case 'first':
          focusNode(vsRef.current?.scrollToStart());
          break;

        case 'last':
          focusNode(vsRef.current?.scrollToEnd());
          break;

        case 'prev-level':
          if (!dFocusItem.isLeaf && isExpand) {
            onExpandChange(dFocusItem);
          } else if (dFocusItem.parent) {
            vsRef.current?.scrollToItem(dFocusItem.parent);
            focusNode(dFocusItem.parent);
          }
          break;

        case 'next-level':
          if (!dFocusItem.isLeaf) {
            if (isExpand) {
              focusNode(vsRef.current?.scrollToNested());
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
  });

  useImperativeHandle(ref, () => handleKeyDown, [handleKeyDown]);

  const vsPerformance = useMemo<DVirtualScrollPerformance<AbstractTreeNode<V, T>>>(
    () => ({
      dList,
      dExpands: dExpandIds,
      dItemSize: 32,
      dItemNested: (item) => ({
        list: item.children,
        emptySize: 32,
        inAriaSetsize: true,
      }),
      dItemKey: (item) => item.id,
      dFocusable: (item) => item.enabled,
    }),
    [dExpandIds, dList]
  );

  return (
    <DVirtualScroll
      {...vsPerformance}
      ref={vsRef}
      dFillNode={<li></li>}
      dItemRender={(item, index, { aria, vsList }) => {
        if (item.children) {
          const isExpand = dExpandIds.has(item.id);

          return (
            <li
              {...aria}
              key={item.id}
              className={getClassName(`${dPrefix}tree__option-group`, {
                [`${dPrefix}tree__option-group--root`]: aria['aria-level'] === 1,
              })}
              role="treeitem"
              aria-expanded={isExpand}
              aria-selected={item.checked}
              aria-disabled={item.disabled}
            >
              <div
                id={dGetGroupId(item.id)}
                className={getClassName(`${dPrefix}tree__option`, {
                  [`${dPrefix}tree__option--root`]: aria['aria-level'] === 1,
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
                    dInputRender={(el) => cloneHTMLElement(el, { tabIndex: -1 })}
                  ></DCheckbox>
                )}
                <div className={`${dPrefix}tree__option-content`}>{dCustomItem ? dCustomItem(item.origin) : item.origin.label}</div>
              </div>
              {!item.origin.loading && (
                <DCollapseTransition
                  dOriginalSize={{
                    height: 'auto',
                  }}
                  dCollapsedStyle={{
                    height: 0,
                  }}
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
                      {vsList}
                    </ul>
                  )}
                </DCollapseTransition>
              )}
            </li>
          );
        }

        return (
          <li
            {...aria}
            key={item.id}
            id={dGetItemId(item.id)}
            className={getClassName(`${dPrefix}tree__option`, {
              [`${dPrefix}tree__option--root`]: aria['aria-level'] === 1,
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
                dInputRender={(el) => cloneHTMLElement(el, { tabIndex: -1 })}
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
      {({ render, vsList }) =>
        render(
          // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
          <ul
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}tree`, {
              [`${dPrefix}tree--line`]: dShowLine,
            })}
            tabIndex={restProps.tabIndex ?? -1}
            role="tree"
            aria-multiselectable={dMultiple}
            aria-activedescendant={isUndefined(dFocusItem) ? undefined : dGetItemId(dFocusItem.id)}
          >
            {dList.length === 0 ? (
              <li className={`${dPrefix}tree__empty`} style={{ marginLeft: 0 }}>
                <div className={`${dPrefix}tree__option-content`}>{t('No Data')}</div>
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

export const DPanel: <V extends DId, T extends DTreeItem<V>>(
  props: DPanelProps<V, T> & React.RefAttributes<ComboboxKeyDownRef>
) => ReturnType<typeof Panel> = React.forwardRef(Panel) as any;
