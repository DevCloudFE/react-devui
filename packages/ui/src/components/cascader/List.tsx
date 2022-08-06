import type { DId } from '../../utils/global';
import type { AbstractTreeNode, MultipleTreeNode } from '../tree/node';
import type { DVirtualScrollPerformance, DVirtualScrollRef } from '../virtual-scroll';
import type { DCascaderItem } from './Cascader';
import type { Subject } from 'rxjs';

import { isUndefined } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';

import { usePrefixConfig, useTranslation, useEventCallback } from '../../hooks';
import { LoadingOutlined, RightOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DCheckbox } from '../checkbox';
import { DVirtualScroll } from '../virtual-scroll';

export interface DListProps<ID extends DId, T> {
  dListId?: string;
  dGetItemId: (value: ID) => string;
  dNodes: AbstractTreeNode<ID, T>[];
  dSelected: ID | null | Set<ID>;
  dFocusNode: AbstractTreeNode<ID, T> | undefined;
  dCustomItem?: (item: T) => React.ReactNode;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  dRoot: boolean;
  onSelectedChange: (value: ID | null | ID[]) => void;
  onClose: () => void;
  onFocusChange: (node: AbstractTreeNode<ID, T>) => void;
  onKeyDown$: Subject<'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level' | 'click'>;
}

export function DList<ID extends DId, T extends DCascaderItem<ID>>(props: DListProps<ID, T>): JSX.Element | null {
  const {
    dListId,
    dGetItemId,
    dNodes,
    dSelected,
    dFocusNode,
    dCustomItem,
    dMultiple,
    dOnlyLeafSelectable,
    dFocusVisible,
    dRoot,
    onSelectedChange,
    onClose,
    onFocusChange,
    onKeyDown$,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<AbstractTreeNode<ID, T>>>(null);
  //#endregion

  const [t] = useTranslation();

  const isFocus = dFocusNode && dNodes.findIndex((node) => node.id === dFocusNode.id) !== -1;
  const inFocusNode = (() => {
    if (dFocusNode) {
      for (const node of dNodes) {
        if (dFocusNode.id === node.id) {
          return node;
        }
        let _node = dFocusNode;
        while (_node.parent) {
          _node = _node.parent;
          if (_node.id === node.id) {
            return node;
          }
        }
      }
    }
  })();
  const shouldInitFocus = dRoot && isUndefined(dFocusNode);

  const changeSelectByClick = useEventCallback((node: AbstractTreeNode<ID, T>) => {
    if (dMultiple) {
      const checkeds = (node as MultipleTreeNode<ID, T>).changeStatus(node.checked ? 'UNCHECKED' : 'CHECKED', dSelected as Set<ID>);
      onSelectedChange(Array.from(checkeds.keys()));
    } else {
      if (!dOnlyLeafSelectable || node.isLeaf) {
        onSelectedChange(node.id);
      }
      if (node.isLeaf) {
        onClose();
      }
    }
  });

  const handleKeyDown = useEventCallback((code: 'next' | 'prev' | 'first' | 'last' | 'next-level' | 'prev-level' | 'click') => {
    const focusNode = (node: AbstractTreeNode<ID, T> | undefined) => {
      if (node) {
        onFocusChange(node);
      }
    };
    switch (code) {
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
          changeSelectByClick(inFocusNode);
        }
        break;

      default:
        break;
    }
  });

  useEffect(() => {
    if (isFocus || shouldInitFocus) {
      const ob = onKeyDown$.subscribe({
        next: (code) => {
          handleKeyDown(code);
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [handleKeyDown, isFocus, onKeyDown$, shouldInitFocus]);

  const vsPerformance = useMemo<DVirtualScrollPerformance<AbstractTreeNode<ID, T>>>(
    () => ({
      dList: dNodes,
      dItemSize: 32,
      dItemKey: (item) => item.id,
      dFocusable: (item) => item.enabled,
    }),
    [dNodes]
  );

  return (
    <>
      <DVirtualScroll
        {...vsPerformance}
        ref={dVSRef}
        id={dListId}
        className={`${dPrefix}cascader__list`}
        role="listbox"
        aria-multiselectable={dMultiple}
        aria-activedescendant={dRoot && !isUndefined(dFocusNode) ? dGetItemId(dFocusNode.id) : undefined}
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
                changeSelectByClick(item);
              }
            }}
          >
            {dFocusVisible && item.id === dFocusNode?.id && <div className={`${dPrefix}focus-outline`}></div>}
            {dMultiple && (
              <DCheckbox
                dModel={item.checked}
                dDisabled={item.disabled}
                dIndeterminate={item.indeterminate}
                onClick={(e) => {
                  e.stopPropagation();
                  onFocusChange(item);
                  changeSelectByClick(item);
                }}
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
        dEmptyRender={() => (
          <li className={`${dPrefix}cascader__empty`}>
            <div className={`${dPrefix}cascader__option-content`}>{t('No Data')}</div>
          </li>
        )}
      />
      {inFocusNode && !inFocusNode.origin.loading && inFocusNode.children && (
        <DList {...props} dListId={undefined} dNodes={inFocusNode.children} dRoot={false}></DList>
      )}
    </>
  );
}
