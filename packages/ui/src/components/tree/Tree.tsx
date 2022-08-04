import type { DNestedChildren, DId } from '../../utils/global';
import type { DFormControl } from '../form';
import type { DVirtualScrollRef } from '../virtual-scroll';
import type { AbstractTreeNode } from './node';

import { isNull, isUndefined } from 'lodash';
import React, { useState, useId, useMemo, useRef, useImperativeHandle } from 'react';

import { usePrefixConfig, useComponentConfig, useTranslation, useGeneralContext, useEventCallback, useDValue } from '../../hooks';
import { CaretRightOutlined, LoadingOutlined, MinusSquareOutlined, PlusSquareOutlined } from '../../icons';
import { findNested, registerComponentMate, getClassName } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DBaseDesign } from '../_base-design';
import { DFocusVisible } from '../_focus-visible';
import { DCollapseTransition } from '../_transition';
import { DCheckbox } from '../checkbox';
import { useFormControl } from '../form';
import { DVirtualScroll } from '../virtual-scroll';
import { MultipleTreeNode, SingleTreeNode } from './node';

export interface DTreeRef {
  handleKeyDown: React.KeyboardEventHandler;
  handleFocusVisibleChange: (visible: boolean) => void;
}

export interface DTreeItem<V extends DId> {
  label: string;
  value: V;
  loading?: boolean;
  disabled?: boolean;
}

export interface DTreeProps<V extends DId, T extends DTreeItem<V>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dFormControl?: DFormControl;
  dList: DNestedChildren<T>[];
  dModel?: V | null | V[];
  dExpands?: V[];
  dHeight?: number;
  dShowLine?: boolean;
  dDisabled?: boolean;
  dMultiple?: boolean;
  dOnlyLeafSelectable?: boolean;
  dCustomItem?: (item: DNestedChildren<T>) => React.ReactNode;
  onModelChange?: (value: any, item: any) => void;
  onScrollBottom?: () => void;
  onFirstExpand?: (value: V, item: DNestedChildren<T>) => void;
  onExpandsChange?: (ids: V[], items: DNestedChildren<T>[]) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTree' });
function Tree<V extends DId, T extends DTreeItem<V>>(props: DTreeProps<V, T>, ref: React.ForwardedRef<DTreeRef>): JSX.Element | null {
  const {
    dFormControl,
    dList,
    dModel,
    dExpands,
    dHeight,
    dShowLine = false,
    dDisabled = false,
    dMultiple = false,
    dOnlyLeafSelectable = true,
    dCustomItem,
    onModelChange,
    onScrollBottom,
    onFirstExpand,
    onExpandsChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gDisabled } = useGeneralContext();
  //#endregion

  //#region Ref
  const dVSRef = useRef<DVirtualScrollRef<AbstractTreeNode<V, T>>>(null);
  //#endregion

  const dataRef = useRef<{
    expandList: Set<V>;
  }>({ expandList: new Set(dExpands) });

  const [t] = useTranslation();

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
  const nodesMap = useMemo(() => {
    const nodes = new Map<V, AbstractTreeNode<V, T>>();
    const reduceArr = (arr: AbstractTreeNode<V, T>[]) => {
      for (const item of arr) {
        nodes.set(item.id, item);
        if (item.children) {
          reduceArr(item.children);
        }
      }
    };
    reduceArr(renderNodes);
    return nodes;
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

  const [_expandIds, changeExpandIds] = useDValue<V[]>([], dExpands, (value) => {
    if (onExpandsChange) {
      onExpandsChange(
        value,
        value.map((v) => nodesMap.get(v)!.origin)
      );
    }
  });
  const expandIds = useMemo(() => new Set(_expandIds), [_expandIds]);

  const changeSelectByClick = useEventCallback((node: AbstractTreeNode<V, T>) => {
    if (dMultiple) {
      const checkeds = (node as MultipleTreeNode<V, T>).changeStatus(node.checked ? 'UNCHECKED' : 'CHECKED', select as Set<V>);
      changeSelect(Array.from(checkeds.keys()));
    } else {
      if (!dOnlyLeafSelectable || node.isLeaf) {
        changeSelect(node.id);
      }
    }
  });

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
  const changeFocusNode = (item?: AbstractTreeNode<V, T>) => {
    if (!isUndefined(item)) {
      setFocusNode(item);
    }
  };

  const changeExpand = (item: AbstractTreeNode<V, T>) => {
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
        if (!dataRef.current.expandList.has(item.id)) {
          dataRef.current.expandList.add(item.id);
          onFirstExpand?.(item.id, item.origin);
        }
        changeExpandIds((draft) => {
          draft.push(item.id);
        });
      }
    }
  };

  const preventBlur: React.MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  const handleKeyDown = useEventCallback<React.KeyboardEventHandler>((e) => {
    if (focusNode) {
      const isExpand = expandIds.has(focusNode.id);

      switch (e.code) {
        case 'ArrowUp':
          e.preventDefault();
          changeFocusNode(dVSRef.current?.scrollByStep(-1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          changeFocusNode(dVSRef.current?.scrollByStep(1));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (!focusNode.isLeaf && isExpand) {
            changeExpand(focusNode);
          } else if (focusNode.parent) {
            dVSRef.current?.scrollToItem(focusNode.parent);
            changeFocusNode(focusNode.parent);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (!focusNode.isLeaf) {
            if (isExpand) {
              changeFocusNode(dVSRef.current?.scrollByStep(1));
            } else {
              changeExpand(focusNode);
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          changeFocusNode(dVSRef.current?.scrollToStart());
          break;

        case 'End':
          e.preventDefault();
          changeFocusNode(dVSRef.current?.scrollToEnd());
          break;

        case 'Enter':
          e.preventDefault();
          changeSelectByClick(focusNode);
          break;

        default:
          break;
      }
    }
  });

  useImperativeHandle(
    ref,
    () => ({
      handleKeyDown,
      handleFocusVisibleChange: setFocusVisible,
    }),
    [handleKeyDown]
  );

  return (
    <DFocusVisible onFocusVisibleChange={setFocusVisible}>
      {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) => (
        <DBaseDesign dFormControl={dFormControl}>
          <DVirtualScroll
            ref={dVSRef}
            className={getClassName(restProps.className, `${dPrefix}tree`, {
              [`${dPrefix}tree--line`]: dShowLine,
              'is-disabled': disabled,
            })}
            style={{
              ...restProps.style,
              maxHeight: dHeight,
            }}
            tabIndex={restProps.tabIndex ?? (disabled ? -1 : 0)}
            role={restProps.role ?? 'tree'}
            aria-multiselectable={restProps['aria-multiselectable'] ?? dMultiple}
            aria-activedescendant={restProps['aria-activedescendant'] ?? (isUndefined(focusNode) ? undefined : getItemId(focusNode.id))}
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

              handleKeyDown?.(e);
            }}
            dList={renderNodes}
            dExpands={expandIds}
            dItemRender={(item, index, { iARIA, iChildren }) => {
              if (item.children) {
                const isExpand = expandIds.has(item.id);

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
                      id={getGroupId(item.id)}
                      className={getClassName(`${dPrefix}tree__option`, {
                        [`${dPrefix}tree__option--root`]: iARIA['aria-level'] === 1,
                        [`${dPrefix}tree__option--first`]: index === 0,
                        'is-selected': !dMultiple && item.checked,
                        'is-disabled': item.disabled,
                      })}
                      title={item.origin.label}
                      onClick={() => {
                        setFocusNode(item);
                        changeSelectByClick(item);
                      }}
                    >
                      {focusVisible && item.id === focusNode?.id && <div className={`${dPrefix}focus-outline`}></div>}
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

                          changeExpand(item);
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
                        <DCheckbox dModel={item.checked} dDisabled={item.disabled} dIndeterminate={item.indeterminate}></DCheckbox>
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
                            transition: ['height', 'padding', 'margin']
                              .map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`)
                              .join(', '),
                          },
                          leaving: {
                            transition: ['height', 'padding', 'margin']
                              .map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`)
                              .join(', '),
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
                            aria-labelledby={getGroupId(item.id)}
                          >
                            {item.children!.length === 0 ? (
                              <li className={`${dPrefix}tree__empty`}>
                                <div className={`${dPrefix}tree__option-content`}>{t('No Data')}</div>
                              </li>
                            ) : (
                              iChildren
                            )}
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
                  id={getItemId(item.id)}
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
                    setFocusNode(item);
                    changeSelectByClick(item);
                  }}
                >
                  {focusVisible && item.id === focusNode?.id && <div className={`${dPrefix}focus-outline`}></div>}
                  {dMultiple && <DCheckbox dModel={item.checked} dDisabled={item.disabled} dIndeterminate={item.indeterminate}></DCheckbox>}
                  <div className={`${dPrefix}tree__option-content`}>{dCustomItem ? dCustomItem(item.origin) : item.origin.label}</div>
                </li>
              );
            }}
            dItemSize={(item) => {
              if (item.children && item.children.length === 0) {
                return 64;
              }
              return 32;
            }}
            dItemNested={(item) => item.children}
            dItemKey={(item) => item.id}
            dFocusable={(item) => item.enabled}
            dFocusItem={focusNode}
            dSizeIncludeNestedItem
            dSize={dHeight ?? Infinity}
            dEmpty={
              <li className={`${dPrefix}tree__empty`}>
                <div className={`${dPrefix}tree__option-content`}>{t('No Data')}</div>
              </li>
            }
            onScrollEnd={onScrollBottom}
          ></DVirtualScroll>
        </DBaseDesign>
      )}
    </DFocusVisible>
  );
}

export const DTree: <V extends DId, T extends DTreeItem<V>>(
  props: DTreeProps<V, T> & { ref?: React.ForwardedRef<DTreeRef> }
) => ReturnType<typeof Tree> = React.forwardRef(Tree) as any;
