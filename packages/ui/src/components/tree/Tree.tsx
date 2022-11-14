import type { DId } from '../../utils/types';
import type { ComboboxKeyDownRef } from '../_keyboard';
import type { DFormControl } from '../form';
import type { AbstractTreeNode } from './abstract-node';

import { isNull, isUndefined } from 'lodash';
import React, { useState, useMemo, useRef } from 'react';

import { useId } from '@react-devui/hooks';
import { findNested, getClassName } from '@react-devui/utils';

import { useGeneralContext, useDValue } from '../../hooks';
import { registerComponentMate } from '../../utils';
import { DFocusVisible } from '../_focus-visible';
import { useFormControl } from '../form';
import { useComponentConfig, usePrefixConfig } from '../root';
import { DPanel } from './Panel';
import { MultipleTreeNode } from './multiple-node';
import { SingleTreeNode } from './single-node';

export interface DTreeItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
  children?: DTreeItem<V>[];
}

export interface DTreeProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
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
  onFirstExpand?: (value: T['value'], item: T) => void;
  onExpandsChange?: (ids: T['value'][], items: T[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTree' as const });
export function DTree<V extends DId, T extends DTreeItem<V>>(props: DTreeProps<V, T>): JSX.Element | null {
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

  //#region Ref
  const comboboxKeyDownRef = useRef<ComboboxKeyDownRef>(null);
  //#endregion

  const dataRef = useRef<{
    hasExpandList: Set<V>;
  }>({
    hasExpandList: new Set(dExpands),
  });

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
      {({ render: renderFocusVisible }) =>
        renderFocusVisible(
          <DPanel
            {...restProps}
            ref={comboboxKeyDownRef}
            className={getClassName(restProps.className, {
              'is-disabled': disabled,
            })}
            style={{
              ...restProps.style,
              maxHeight: dHeight,
            }}
            tabIndex={restProps.tabIndex ?? (disabled ? -1 : 0)}
            onKeyDown={(e) => {
              restProps.onKeyDown?.(e);

              switch (e.code) {
                case 'ArrowUp':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('prev');
                  break;

                case 'ArrowDown':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('next');
                  break;

                case 'ArrowLeft':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('prev-level');
                  break;

                case 'ArrowRight':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('next-level');
                  break;

                case 'Home':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('first');
                  break;

                case 'End':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('last');
                  break;

                case 'Enter':
                  e.preventDefault();
                  comboboxKeyDownRef.current?.('click');
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
            dPadding={undefined}
            dFocusItem={focusNode}
            dCustomItem={dCustomItem}
            dShowLine={dShowLine}
            dMultiple={dMultiple}
            dFocusVisible={focusVisible}
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
        )
      }
    </DFocusVisible>
  );
}
