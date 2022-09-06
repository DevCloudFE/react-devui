import type { DId } from '../../utils';
import type { DComboboxKeyboardSupportKey } from '../_keyboard-support';
import type { DFormControl } from '../form';
import type { AbstractTreeNode } from './abstract-node';

import { isNull, isUndefined } from 'lodash';
import React, { useState, useId, useMemo, useRef } from 'react';

import { useEventNotify } from '@react-devui/hooks';
import { findNested, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DFocusVisible } from '../_focus-visible';
import { useFormControl } from '../form';
import { DPanel } from './Panel';
import { MultipleTreeNode } from './multiple-node';
import { SingleTreeNode } from './single-node';

export interface DTreeItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
}

export interface DTreeProps<V extends DId, T extends DTreeItem<V> & { children?: T[] }>
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: T[];
  dModel?: V | null | V[];
  dHeight?: number;
  dExpands?: V[];
  dExpandAll?: boolean;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: T) => React.ReactNode;
  onModelChange?: (value: any, item: any) => void;
  onFirstExpand?: (value: V, item: T) => void;
  onExpandsChange?: (ids: V[], items: T[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTree' });
export function DTree<V extends DId, T extends DTreeItem<V> & { children?: T[] }>(props: DTreeProps<V, T>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dHeight,
    dExpands,
    dExpandAll = false,
    dShowLine = false,
    dDisabled = false,
    dMultiple = false,
    dOnlyLeafSelectable = true,
    dCustomItem,
    onModelChange,
    onFirstExpand,
    onExpandsChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  const dataRef = useRef<{
    hasExpandList: Set<V>;
  }>({
    hasExpandList: new Set(dExpands),
  });

  const [eventId, onKeyDown$] = useEventNotify<[DComboboxKeyboardSupportKey | 'click']>();

  const uniqueId = useId();
  const getGroupId = (val: V) => `${dPrefix}tree-group-${val}-${uniqueId}`;
  const getItemId = (val: V) => `${dPrefix}tree-item-${val}-${uniqueId}`;

  const renderNodes = useMemo(
    () =>
      dList.map((item) =>
        dMultiple
          ? new MultipleTreeNode(item, (origin) => origin.value, {
              disabled: item.disabled,
            })
          : new SingleTreeNode(item, (origin) => origin.value, {
              disabled: item.disabled,
            })
      ),
    [dMultiple, dList]
  );
  const [nodesMap, initExpandAll] = useMemo(() => {
    const nodes = new Map<V, AbstractTreeNode<V, T>>();
    const expandAllNodes: V[] = [];
    const reduceArr = (arr: AbstractTreeNode<V, T>[]) => {
      for (const item of arr) {
        nodes.set(item.id, item);
        if (item.children) {
          expandAllNodes.push(item.id);
          reduceArr(item.children);
        }
      }
    };
    reduceArr(renderNodes);
    return [nodes, expandAllNodes];
  }, [renderNodes]);

  const formControlInject = useFormControl(dFormControl);
  const [_select, changeSelect] = useDValue<V | null | V[]>(
    dMultiple ? [] : null,
    dModel,
    (value) => {
      if (onModelChange) {
        if (dMultiple) {
          onModelChange(
            value,
            (value as V[]).map((v) => nodesMap.get(v)!.origin)
          );
        } else {
          onModelChange(value, isNull(value) ? null : nodesMap.get(value as V)?.origin);
        }
      }
    },
    undefined,
    formControlInject
  );
  const select = useMemo(() => (dMultiple ? new Set(_select as V[]) : (_select as V | null)), [_select, dMultiple]);
  renderNodes.forEach((node) => {
    node.updateStatus(select);
  });

  const [_expandIds, changeExpandIds] = useDValue<V[]>(dExpandAll ? initExpandAll : [], dExpands, (value) => {
    if (onExpandsChange) {
      onExpandsChange(
        value,
        value.map((v) => nodesMap.get(v)!.origin)
      );
    }
  });
  const expandIds = useMemo(() => new Set(_expandIds), [_expandIds]);

  const disabled = dDisabled || gDisabled || dFormControl?.control.disabled;

  const hasSelected = dMultiple ? (select as Set<V>).size > 0 : !isNull(select);

  const [focusVisible, setFocusVisible] = useState(false);

  const [_focusNode, setFocusNode] = useState<AbstractTreeNode<V, T> | undefined>();
  const focusNode = (() => {
    let node: AbstractTreeNode<V, T> | undefined;

    if (_focusNode) {
      node = nodesMap.get(_focusNode.id);
      if (node && node.enabled) {
        return node;
      }
    }

    if (hasSelected) {
      node = findNested(renderNodes, (node) => node.enabled && node.checked);
    }

    if (isUndefined(node)) {
      node = findNested(renderNodes, (node) => node.enabled);
    }

    return node;
  })();

  return (
    <DFocusVisible onFocusVisibleChange={setFocusVisible}>
      {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) => (
        <DPanel
          {...restProps}
          className={getClassName(restProps.className, {
            'is-disabled': disabled,
          })}
          style={{
            ...restProps.style,
            maxHeight: dHeight,
          }}
          tabIndex={restProps.tabIndex ?? (disabled ? -1 : 0)}
          onFocus={(e) => {
            restProps.onFocus?.(e);
            fvOnFocus(e);
          }}
          onBlur={(e) => {
            restProps.onBlur?.(e);
            fvOnBlur(e);
          }}
          onKeyDown={(e) => {
            restProps.onKeyDown?.(e);
            fvOnKeyDown(e);

            switch (e.code) {
              case 'ArrowUp':
                e.preventDefault();
                onKeyDown$('prev');
                break;

              case 'ArrowDown':
                e.preventDefault();
                onKeyDown$('next');
                break;

              case 'ArrowLeft':
                e.preventDefault();
                onKeyDown$('prev-level');
                break;

              case 'ArrowRight':
                e.preventDefault();
                onKeyDown$('next-level');
                break;

              case 'Home':
                e.preventDefault();
                onKeyDown$('first');
                break;

              case 'End':
                e.preventDefault();
                onKeyDown$('last');
                break;

              case 'Enter':
                e.preventDefault();
                onKeyDown$('click');
                break;

              default:
                break;
            }
          }}
          dGetGroupId={getGroupId}
          dGetItemId={getItemId}
          dList={renderNodes}
          dExpandIds={expandIds}
          dHeight={dHeight ?? Infinity}
          dFocusItem={focusNode}
          dCustomItem={dCustomItem}
          dShowLine={dShowLine}
          dMultiple={dMultiple}
          dFocusVisible={focusVisible}
          dEventId={eventId}
          onFocusChange={setFocusNode}
          onExpandChange={(item) => {
            const isExpand = expandIds.has(item.id);

            if (!item.origin.loading) {
              if (isExpand) {
                changeExpandIds((draft) => {
                  draft.splice(
                    draft.findIndex((id) => id === item.id),
                    1
                  );
                });
              } else {
                if (!dataRef.current.hasExpandList.has(item.id)) {
                  dataRef.current.hasExpandList.add(item.id);
                  onFirstExpand?.(item.id, item.origin);
                }
                changeExpandIds((draft) => {
                  draft.push(item.id);
                });
              }
            }
          }}
          onClickItem={(node) => {
            if (dMultiple) {
              const checkeds = (node as MultipleTreeNode<V, T>).changeStatus(node.checked ? 'UNCHECKED' : 'CHECKED', select as Set<V>);
              changeSelect(Array.from(checkeds.keys()));
            } else {
              if (!dOnlyLeafSelectable || node.isLeaf) {
                changeSelect(node.id);
              }
            }
          }}
        ></DPanel>
      )}
    </DFocusVisible>
  );
}
