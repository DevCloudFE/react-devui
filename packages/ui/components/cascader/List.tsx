import type { DId } from '../../utils';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { AbstractTreeNode } from '../tree/node';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DCascaderItem } from './Cascader';
import type { Subject } from 'rxjs';

import { isUndefined } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { useEventCallback } from '@react-devui/hooks';
import { LoadingOutlined, RightOutlined } from '@react-devui/icons';
import { getClassName } from '@react-devui/utils';

import { usePrefixConfig, useTranslation } from '../../hooks';
import { DCheckbox } from '../checkbox';
import { DVirtualScroll } from '../virtual-scroll';

export interface DListProps<V extends DId, T extends DCascaderItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dGetItemId: (value: V) => string;
  dList: AbstractTreeNode<V, T>[];
  dFocusItem: AbstractTreeNode<V, T> | undefined;
  dCustomItem?: (item: T) => React.ReactNode;
  dMultiple: boolean;
  dFocusVisible: boolean;
  dRoot: boolean;
  onFocusChange: (node: AbstractTreeNode<V, T>) => void;
  onClickItem: (node: AbstractTreeNode<V, T>) => void;
  onKeyDown$: Subject<DComboboxKeyboardSupportKey | 'click'>;
}

export function DList<V extends DId, T extends DCascaderItem<V>>(props: DListProps<V, T>): JSX.Element | null {
  const {
    dGetItemId,
    dList,
    dFocusItem,
    dCustomItem,
    dMultiple,
    dFocusVisible,
    dRoot,
    onClickItem,
    onFocusChange,
    onKeyDown$,

    ...restProps
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<AbstractTreeNode<V, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const isFocus = dFocusItem && dList.findIndex((node) => node.id === dFocusItem.id) !== -1;
  const inFocusNode = (() => {
    if (dFocusItem) {
      for (const node of dList) {
        if (dFocusItem.id === node.id) {
          return node;
        }
        let _node = dFocusItem;
        while (_node.parent) {
          _node = _node.parent;
          if (_node.id === node.id) {
            return node;
          }
        }
      }
    }
  })();
  const shouldInitFocus = dRoot && isUndefined(dFocusItem);

  const handleKeyDown = useEventCallback((key: DComboboxKeyboardSupportKey | 'click') => {
    const focusNode = (node: AbstractTreeNode<V, T> | undefined) => {
      if (node) {
        onFocusChange(node);
      }
    };
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
        if (inFocusNode && inFocusNode.parent) {
          onFocusChange(inFocusNode.parent);
        }
        break;

      case 'next-level':
        if (inFocusNode && inFocusNode.children) {
          for (const node of inFocusNode.children) {
            if (node.enabled) {
              onFocusChange(node);
              break;
            }
          }
        }
        break;

      case 'click':
        if (inFocusNode) {
          onClickItem(inFocusNode);
        }
        break;

      default:
        break;
    }
  });

  useEffect(() => {
    if (isFocus || shouldInitFocus) {
      const ob = onKeyDown$.subscribe({
        next: (key) => {
          handleKeyDown(key);
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [handleKeyDown, isFocus, onKeyDown$, shouldInitFocus]);

  const vsPerformance = useMemo<DVirtualScrollPerformance<AbstractTreeNode<V, T>>>(
    () => ({
      dList,
      dItemSize: 32,
      dItemKey: (item) => item.id,
      dFocusable: (item) => item.enabled,
    }),
    [dList]
  );

  return (
    <>
      <DVirtualScroll
        {...vsPerformance}
        ref={dVSRef}
        dFillNode={<li></li>}
        dItemRender={(item, index, { iARIA }) => (
          <li
            {...iARIA}
            key={item.id}
            id={dGetItemId(item.id)}
            className={getClassName(`${dPrefix}cascader__option`, {
              'is-focus': item.id === inFocusNode?.id,
              'is-selected': !dMultiple && item.checked,
              'is-disabled': item.disabled,
            })}
            title={item.origin.label}
            role="option"
            aria-selected={item.checked}
            aria-disabled={item.disabled}
            onClick={() => {
              onFocusChange(item);
              if (!dMultiple || item.isLeaf) {
                onClickItem(item);
              }
            }}
          >
            {dFocusVisible && item.id === dFocusItem?.id && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && (
              <DCheckbox
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusChange(item);
                  onClickItem(item);
                }}
                dModel={item.checked}
                dDisabled={item.disabled}
                dIndeterminate={item.indeterminate}
              ></DCheckbox>
            )}
            <div className={`${dPrefix}cascader__option-content`}>{dCustomItem ? dCustomItem(item.origin) : item.origin.label}</div>
            {!item.isLeaf && (
              <div className={`${dPrefix}cascader__option-icon`}>{item.origin.loading ? <LoadingOutlined dSpin /> : <RightOutlined />}</div>
            )}
          </li>
        )}
        dFocusItem={inFocusNode}
        dSize={264}
        dPadding={4}
      >
        {({ vsScrollRef, vsRender, vsOnScroll }) => (
          // eslint-disable-next-line jsx-a11y/aria-activedescendant-has-tabindex
          <ul
            ref={vsScrollRef}
            {...restProps}
            className={getClassName(restProps.className, `${dPrefix}cascader__list`)}
            tabIndex={restProps.tabIndex ?? -1}
            role={restProps.role ?? 'listbox'}
            aria-multiselectable={restProps['aria-multiselectable'] ?? dMultiple}
            aria-activedescendant={
              restProps['aria-activedescendant'] ?? (dRoot && !isUndefined(dFocusItem) ? dGetItemId(dFocusItem.id) : undefined)
            }
            onScroll={(e) => {
              restProps.onScroll?.(e);
              vsOnScroll(e);
            }}
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
      {inFocusNode && !inFocusNode.origin.loading && inFocusNode.children && (
        <DList {...props} id={undefined} dList={inFocusNode.children} dRoot={false}></DList>
      )}
    </>
  );
}
