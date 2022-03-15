import type { DId } from '../../types';
import type { DVirtualScrollRef } from '../_virtual-scroll';
import type { AbstractTreeNode, MultipleTreeNode, SingleTreeNode } from '../tree';
import type { DCascaderOption } from './Cascader';
import type { Subject } from 'rxjs';

import { isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';

import { usePrefixConfig, useTranslation, useEventCallback } from '../../hooks';
import { LoadingOutlined, RightOutlined } from '../../icons';
import { getClassName } from '../../utils';
import { DVirtualScroll } from '../_virtual-scroll';
import { DCheckbox } from '../checkbox';

export interface DListProps<ID extends DId, T> {
  listId?: string;
  getOptionId: (value: ID) => string;
  dNodes: AbstractTreeNode<ID, T>[];
  dSelected: ID | null | ID[];
  dFocusNode: AbstractTreeNode<ID, T> | undefined;
  dCustomOption?: (option: T) => React.ReactNode;
  dMultiple: boolean;
  dOnlyLeafSelectable?: boolean;
  dFocusVisible: boolean;
  dRoot: boolean;
  onSelectedChange: (value: ID | null | ID[]) => void;
  onClose: () => void;
  onFocusChange: (option: AbstractTreeNode<ID, T>) => void;
  onKeyDown$: Subject<React.KeyboardEvent<HTMLInputElement>>;
}

export function DList<ID extends DId, T extends DCascaderOption<ID>>(props: DListProps<ID, T>): JSX.Element | null {
  const {
    listId,
    getOptionId,
    dNodes,
    dSelected,
    dFocusNode,
    dCustomOption,
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

  const [t] = useTranslation('Common');

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

  const changeSelectByClick = useEventCallback((option: AbstractTreeNode<ID, T>, isSwitch?: boolean) => {
    if (dMultiple) {
      isSwitch = isSwitch ?? true;

      const checkeds = (option as MultipleTreeNode<ID, T>).changeStatus(
        isSwitch ? (option.checked ? 'UNCHECKED' : 'CHECKED') : 'CHECKED',
        dSelected as ID[]
      );
      onSelectedChange(checkeds);
    } else {
      if (!dOnlyLeafSelectable || option.isLeaf) {
        (option as SingleTreeNode<ID, T>).setChecked();
        onSelectedChange(option.id);
      }
      if (option.isLeaf) {
        onClose();
      }
    }
  });

  const shouldInitFocus = dRoot && isUndefined(dFocusNode);
  const handleKeyDown = useEventCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const focusNode = (option: AbstractTreeNode<ID, T> | undefined) => {
      if (option) {
        onFocusChange(option);
      }
    };
    if (isFocus && inFocusNode) {
      switch (e.code) {
        case 'Enter':
          e.preventDefault();
          changeSelectByClick(inFocusNode, false);
          break;

        case 'Space':
          e.preventDefault();
          changeSelectByClick(inFocusNode, dMultiple);
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (inFocusNode.parent) {
            onFocusChange(inFocusNode.parent);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (inFocusNode.children && inFocusNode.children[0]) {
            onFocusChange(inFocusNode.children[0]);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          focusNode(dVSRef.current?.scrollByStep(-1));
          break;

        case 'ArrowDown':
          e.preventDefault();
          focusNode(dVSRef.current?.scrollByStep(1));
          break;

        case 'Home':
          e.preventDefault();
          focusNode(dVSRef.current?.scrollToStart());
          break;

        case 'End':
          e.preventDefault();
          focusNode(dVSRef.current?.scrollToEnd());
          break;

        default:
          break;
      }
    } else if (shouldInitFocus) {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        focusNode(dVSRef.current?.scrollToStart());
      }
    }
  });

  useEffect(() => {
    if (isFocus || shouldInitFocus) {
      const ob = onKeyDown$.subscribe({
        next: (e) => {
          handleKeyDown(e);
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [handleKeyDown, isFocus, onKeyDown$, shouldInitFocus]);

  return (
    <>
      <DVirtualScroll
        ref={dVSRef}
        id={listId}
        className={`${dPrefix}cascader-list`}
        role="listbox"
        aria-multiselectable={dMultiple}
        aria-activedescendant={dRoot && dFocusNode ? getOptionId(dFocusNode.id) : undefined}
        dList={dNodes}
        dItemRender={(item, index, renderProps) => {
          return (
            <li
              {...renderProps}
              key={item.id}
              id={getOptionId(item.id)}
              className={getClassName(`${dPrefix}cascader-list__option`, {
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
                  disabled={item.disabled}
                  dModel={[item.checked]}
                  dIndeterminate={item.indeterminate}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusChange(item);
                    changeSelectByClick(item);
                  }}
                ></DCheckbox>
              )}
              <div className={`${dPrefix}cascader-list__option-content`}>
                {dCustomOption ? dCustomOption(item.origin) : item.origin.label}
              </div>
              {!item.isLeaf && (
                <div className={`${dPrefix}cascader-list__icon`}>{item.origin.loading ? <LoadingOutlined dSpin /> : <RightOutlined />}</div>
              )}
            </li>
          );
        }}
        dGetSize={() => 32}
        dCompareItem={(a, b) => a.id === b.id}
        dCanFocus={(item) => item.enabled}
        dFocusItem={inFocusNode}
        dSize={264}
        dPadding={4}
        dEmpty={
          <li className={`${dPrefix}cascader-list__empty`}>
            <div className={`${dPrefix}cascader-list__option-content`}>{t('No Data')}</div>
          </li>
        }
      />
      {inFocusNode && !inFocusNode.origin.loading && inFocusNode.children && (
        <DList {...props} listId={undefined} dNodes={inFocusNode.children} dRoot={false}></DList>
      )}
    </>
  );
}
