import type { DId } from '../../utils/types';

import { isNull, isNumber, isUndefined, nth } from 'lodash';
import React, { useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useEventCallback, useId, useRefExtra } from '@react-devui/hooks';
import { getClassName, getOriginalSize, getVerticalSidePosition, scrollToView } from '@react-devui/utils';

import { useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DFocusVisible } from '../_focus-visible';
import { DPopup, useNestedPopup } from '../_popup';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig, useTranslation } from '../root';
import { DSeparator } from '../separator';
import { DGroup } from './Group';
import { DItem } from './Item';
import { DSub } from './Sub';
import { checkEnableItem, getSameLevelEnableItems } from './utils';

export interface DDropdownRef {
  updatePosition: () => void;
}

export interface DDropdownItem<ID extends DId> {
  id: ID;
  label: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  children?: DDropdownItem<ID>[];
}

export interface DDropdownProps<ID extends DId, T extends DDropdownItem<ID>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dList: T[];
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dTrigger?: 'hover' | 'click';
  dArrow?: boolean;
  dCloseOnClick?: boolean;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (id: T['id'], item: T) => void;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDropdown' as const });
function Dropdown<ID extends DId, T extends DDropdownItem<ID>>(
  props: DDropdownProps<ID, T>,
  ref: React.ForwardedRef<DDropdownRef>
): JSX.Element | null {
  const {
    children,
    dList,
    dVisible,
    dPlacement = 'bottom-right',
    dTrigger = 'hover',
    dArrow = false,
    dCloseOnClick = true,
    dZIndex,
    onVisibleChange,
    onItemClick,
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dropdownRef = useRef<HTMLDivElement>(null);
  const childRef = useRefExtra(() => document.getElementById(triggerId));
  const ulRef = useRef<HTMLUListElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}dropdown-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}dropdown-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  //#endregion

  const dataRef = useRef<{
    updatePosition: Map<ID, () => void>;
  }>({
    updatePosition: new Map(),
  });

  const [t] = useTranslation();

  const uniqueId = useId();
  const id = restProps.id ?? `${dPrefix}dropdown-${uniqueId}`;
  const triggerId = children.props.id ?? `${dPrefix}dropdown-trigger-${uniqueId}`;
  const getItemId = (id: ID) => `${dPrefix}dropdown-item-${id}-${uniqueId}`;

  const { popupIds, setPopupIds, addPopupId, removePopupId } = useNestedPopup<ID>();
  const [focusIds, setFocusIds] = useState<ID[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const focusId = (() => {
    if (isFocus) {
      let id: ID | undefined;
      for (const [index, focusId] of focusIds.entries()) {
        id = focusId;
        if (nth(popupIds, index)?.id !== focusId) {
          break;
        }
      }
      return id;
    }
  })();
  const focusFirst = () => {
    const ids: ID[] = [];
    const reduceArr = (arr: T[]) => {
      for (const item of arr) {
        if (ids.length === 1) {
          break;
        }

        if (item.type === 'group' && item.children) {
          reduceArr(item.children as T[]);
        } else if (checkEnableItem(item)) {
          ids.push(item.id);
        }
      }
    };
    reduceArr(dList);
    setFocusIds(ids);
  };
  const focusLast = () => {
    const ids: ID[] = [];
    const reduceArr = (arr: T[]) => {
      for (let index = arr.length - 1; index >= 0; index--) {
        if (ids.length === 1) {
          break;
        }

        const item = arr[index];
        if (item.type === 'group' && item.children) {
          reduceArr(item.children as T[]);
        } else if (checkEnableItem(item)) {
          ids.push(item.id);
        }
      }
    };
    reduceArr(dList);
    setFocusIds(ids);
  };

  const [visible, _changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);
  const changeVisible = (visible: boolean) => {
    if (!visible) {
      setPopupIds([]);
    }

    _changeVisible(visible);
  };

  const maxZIndex = useMaxIndex(visible);
  const zIndex = (() => {
    if (isUndefined(dZIndex)) {
      return maxZIndex;
    } else {
      return dZIndex;
    }
  })();

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const [arrowPosition, setArrowPosition] = useState<React.CSSProperties>();
  const updatePosition = useEventCallback(() => {
    if (visible && childRef.current && dropdownRef.current) {
      const { width, height } = getOriginalSize(dropdownRef.current);
      const { top, left, transformOrigin, arrowPosition } = getVerticalSidePosition(
        childRef.current,
        { width, height },
        {
          placement: dPlacement,
          inWindow: WINDOW_SPACE,
        }
      );
      setPopupPositionStyle({ top, left });
      setTransformOrigin(transformOrigin);
      setArrowPosition(arrowPosition);
    }
  });

  const preventBlur: React.MouseEventHandler<HTMLElement> = (e) => {
    if (e.button === 0) {
      e.preventDefault();
    }
  };

  let handleKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined;
  const nodes = (() => {
    const getNodes = (arr: T[], level: number, subParents: T[]): JSX.Element[] =>
      arr.map((item) => {
        const {
          id: itemId,
          label: itemLabel,
          type: itemType,
          icon: itemIcon,
          disabled: itemDisabled = false,
          separator: itemSeparator,
          children,
        } = item;

        const newSubParents = itemType === 'sub' ? subParents.concat([item]) : subParents;
        const id = getItemId(itemId);
        const isFocus = itemId === focusId;
        const isEmpty = !(children && children.length > 0);
        const popupState = popupIds.find((v) => v.id === itemId);

        const handleItemClick = () => {
          onItemClick?.(itemId, item);

          setFocusIds(subParents.map((parentItem) => parentItem.id).concat([itemId]));
          if (dCloseOnClick) {
            changeVisible(false);
          }
        };

        if (isFocus) {
          handleKeyDown = (e) => {
            const sameLevelItems = getSameLevelEnableItems((nth(subParents, -1)?.children as T[]) ?? dList);
            const focusItem = (val?: T) => {
              if (val) {
                setFocusIds(subParents.map((parentItem) => parentItem.id).concat([val.id]));
              }
            };
            const scrollToItem = (val?: T) => {
              if (val) {
                const el = document.getElementById(getItemId(val.id));
                if (el && ulRef.current) {
                  scrollToView(el, ulRef.current, 4);
                }
              }
            };

            switch (e.code) {
              case 'ArrowUp': {
                e.preventDefault();
                const index = sameLevelItems.findIndex((sameLevelItem) => sameLevelItem.id === itemId);
                const item = nth(sameLevelItems, index - 1);
                focusItem(item);
                scrollToItem(item);
                if (item && nth(popupIds, -1)?.id === itemId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowDown': {
                e.preventDefault();
                const index = sameLevelItems.findIndex((sameLevelItem) => sameLevelItem.id === itemId);
                const item = nth(sameLevelItems, (index + 1) % sameLevelItems.length);
                focusItem(item);
                scrollToItem(item);
                if (item && nth(popupIds, -1)?.id === itemId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowLeft': {
                e.preventDefault();
                setPopupIds(popupIds.slice(0, -1));
                const ids = subParents.map((item) => item.id);
                if (ids.length > 0) {
                  setFocusIds(ids);
                }
                break;
              }

              case 'ArrowRight':
                e.preventDefault();
                if (itemType === 'sub') {
                  addPopupId(itemId);
                  if (children) {
                    const newFocusItem = nth(getSameLevelEnableItems(children), 0);
                    if (newFocusItem) {
                      setFocusIds(newSubParents.map((parentItem) => parentItem.id).concat([newFocusItem.id]));
                    }
                  }
                }
                break;

              case 'Home':
                e.preventDefault();
                focusItem(nth(sameLevelItems, 0));
                if (ulRef.current) {
                  ulRef.current.scrollTop = 0;
                }
                break;

              case 'End':
                e.preventDefault();
                focusItem(nth(sameLevelItems, -1));
                if (ulRef.current) {
                  ulRef.current.scrollTop = ulRef.current.scrollHeight;
                }
                break;

              case 'Enter':
              case 'Space':
                e.preventDefault();
                if (itemType === 'item') {
                  handleItemClick();
                } else if (itemType === 'sub') {
                  addPopupId(itemId);
                }
                break;

              default:
                break;
            }
          };
        }

        return (
          <React.Fragment key={itemId}>
            {itemType === 'item' ? (
              <DItem
                dId={id}
                dLevel={level}
                dIcon={itemIcon}
                dFocusVisible={focusVisible && isFocus}
                dDisabled={itemDisabled}
                onItemClick={handleItemClick}
              >
                {itemLabel}
              </DItem>
            ) : itemType === 'group' ? (
              <DGroup dId={id} dLevel={level} dList={children && getNodes(children as T[], level + 1, newSubParents)} dEmpty={isEmpty}>
                {itemLabel}
              </DGroup>
            ) : (
              <DSub
                ref={(fn) => {
                  if (isNull(fn)) {
                    dataRef.current.updatePosition.delete(itemId);
                  } else {
                    dataRef.current.updatePosition.set(itemId, fn);
                  }
                }}
                dId={id}
                dLevel={level}
                dList={children && getNodes(children as T[], 0, newSubParents)}
                dPopupState={popupState?.visible}
                dTrigger={dTrigger}
                dZIndex={
                  isUndefined(zIndex)
                    ? zIndex
                    : isNumber(zIndex)
                    ? zIndex + 1 + subParents.length
                    : `calc(${zIndex} + ${1 + subParents.length})`
                }
                dIcon={itemIcon}
                dEmpty={isEmpty}
                dFocusVisible={focusVisible && isFocus}
                dDisabled={itemDisabled}
                onVisibleChange={(visible) => {
                  if (visible) {
                    if (subParents.length === 0) {
                      setPopupIds([{ id: itemId, visible: true }]);
                    } else {
                      addPopupId(itemId);
                    }
                  } else {
                    removePopupId(itemId);
                  }
                }}
              >
                {itemLabel}
              </DSub>
            )}
            {itemSeparator && <DSeparator style={{ margin: '2px 0' }} />}
          </React.Fragment>
        );
      });

    return getNodes(dList, 0, []);
  })();

  useImperativeHandle(
    ref,
    () => ({
      updatePosition: () => {
        updatePosition();
        for (const fn of dataRef.current.updatePosition.values()) {
          fn();
        }
      },
    }),
    [updatePosition]
  );

  return (
    <DPopup
      dVisible={visible}
      dTrigger={dTrigger}
      dUpdatePosition={{
        fn: updatePosition,
        triggerRef: childRef,
        popupRef: ulRef,
        extraScrollRefs: [],
      }}
      onVisibleChange={changeVisible}
    >
      {({ renderTrigger, renderPopup }) => (
        <>
          <DFocusVisible onFocusVisibleChange={setFocusVisible}>
            {({ render: renderFocusVisible }) =>
              renderFocusVisible(
                renderTrigger(
                  React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                    id: triggerId,
                    tabIndex: children.props.tabIndex ?? 0,
                    role: 'button',
                    'aria-haspopup': 'menu',
                    'aria-expanded': visible,
                    'aria-controls': id,
                    onFocus: (e) => {
                      children.props.onFocus?.(e);

                      setIsFocus(true);
                      focusFirst();
                    },
                    onBlur: (e) => {
                      children.props.onBlur?.(e);

                      setIsFocus(false);
                      changeVisible(false);
                    },
                    onKeyDown: (e) => {
                      children.props.onKeyDown?.(e);

                      if (visible) {
                        handleKeyDown?.(e);
                      } else {
                        switch (e.code) {
                          case 'Enter':
                          case 'Space':
                          case 'ArrowDown':
                            e.preventDefault();
                            focusFirst();
                            changeVisible(true);
                            break;

                          case 'ArrowUp':
                            e.preventDefault();
                            focusLast();
                            changeVisible(true);
                            break;

                          default:
                            break;
                        }
                      }
                    },
                  })
                )
              )
            }
          </DFocusVisible>
          {containerRef.current &&
            ReactDOM.createPortal(
              <DTransition
                dIn={visible}
                dDuring={TTANSITION_DURING_POPUP}
                onEnter={updatePosition}
                afterEnter={() => {
                  afterVisibleChange?.(true);
                }}
                afterLeave={() => {
                  afterVisibleChange?.(false);
                }}
              >
                {(state) => {
                  let transitionStyle: React.CSSProperties = {};
                  switch (state) {
                    case 'enter':
                      transitionStyle = { transform: 'scaleY(0.7)', opacity: 0 };
                      break;

                    case 'entering':
                      transitionStyle = {
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaving':
                      transitionStyle = {
                        transform: 'scaleY(0.7)',
                        opacity: 0,
                        transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-in`).join(', '),
                        transformOrigin,
                      };
                      break;

                    case 'leaved':
                      transitionStyle = { display: 'none' };
                      break;

                    default:
                      break;
                  }

                  return renderPopup(
                    <div
                      ref={dropdownRef}
                      {...restProps}
                      className={getClassName(restProps.className, `${dPrefix}dropdown`)}
                      style={{
                        ...restProps.style,
                        ...popupPositionStyle,
                        zIndex,
                        ...transitionStyle,
                      }}
                      onMouseDown={(e) => {
                        restProps.onMouseDown?.(e);

                        preventBlur(e);
                      }}
                      onMouseUp={(e) => {
                        restProps.onMouseUp?.(e);

                        preventBlur(e);
                      }}
                    >
                      <ul
                        ref={ulRef}
                        id={id}
                        className={`${dPrefix}dropdown__list`}
                        tabIndex={-1}
                        role="menu"
                        aria-labelledby={triggerId}
                        aria-activedescendant={isUndefined(focusId) ? undefined : getItemId(focusId)}
                      >
                        {dList.length === 0 ? <div className={`${dPrefix}dropdown__empty`}>{t('No Data')}</div> : nodes}
                      </ul>
                      {dArrow && <div className={`${dPrefix}dropdown__arrow`} style={arrowPosition}></div>}
                    </div>
                  );
                }}
              </DTransition>,
              containerRef.current
            )}
        </>
      )}
    </DPopup>
  );
}

export const DDropdown: <ID extends DId, T extends DDropdownItem<ID>>(
  props: DDropdownProps<ID, T> & React.RefAttributes<DDropdownRef>
) => ReturnType<typeof Dropdown> = React.forwardRef(Dropdown) as any;
