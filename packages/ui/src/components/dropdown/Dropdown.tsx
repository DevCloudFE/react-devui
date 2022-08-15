import type { DId, DNestedChildren } from '../../utils';

import { isUndefined, nth } from 'lodash';
import React, { useId, useImperativeHandle, useRef, useState } from 'react';

import { useEventCallback, useEventNotify, useIsomorphicLayoutEffect } from '@react-devui/hooks';
import { getClassName, getOriginalSize, getVerticalSidePosition, scrollToView } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig, useTranslation, useMaxIndex, useDValue } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_POPUP } from '../../utils';
import { DFocusVisible } from '../_focus-visible';
import { DPopup, useNestedPopup } from '../_popup';
import { DTransition } from '../_transition';
import { DGroup } from './Group';
import { DItem } from './Item';
import { DSub } from './Sub';
import { checkEnableItem, getSameLevelItems } from './utils';

export interface DDropdownRef {
  updatePosition: () => void;
}

export interface DDropdownItem<ID extends DId> {
  id: ID;
  label: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DDropdownProps<ID extends DId, T extends DDropdownItem<ID>>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactElement;
  dList: DNestedChildren<T>[];
  dVisible?: boolean;
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dTrigger?: 'hover' | 'click';
  dArrow?: boolean;
  dCloseOnClick?: boolean;
  dZIndex?: number | string;
  onVisibleChange?: (visible: boolean) => void;
  afterVisibleChange?: (visible: boolean) => void;
  onItemClick?: (id: ID, item: DNestedChildren<T>) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DDropdown' });
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
    afterVisibleChange,
    onItemClick,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  //#endregion

  const [t] = useTranslation();
  const updatePosition$ = useEventNotify<void>();

  const uniqueId = useId();
  const id = restProps.id ?? `${dPrefix}dropdown-${uniqueId}`;
  const buttonId = children.props.id ?? `${dPrefix}dropdown-button-${uniqueId}`;
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
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (const item of arr) {
        if (ids.length === 1) {
          break;
        }

        if (item.type === 'group' && item.children) {
          reduceArr(item.children);
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
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (let index = arr.length - 1; index >= 0; index--) {
        if (ids.length === 1) {
          break;
        }

        const item = arr[index];
        if (item.type === 'group' && item.children) {
          reduceArr(item.children);
        } else if (checkEnableItem(item)) {
          ids.push(item.id);
        }
      }
    };
    reduceArr(dList);
    setFocusIds(ids);
  };

  const [visible, changeVisible] = useDValue<boolean>(false, dVisible, onVisibleChange);
  useIsomorphicLayoutEffect(() => {
    if (!visible) {
      setPopupIds([]);
    }
  }, [setPopupIds, visible]);

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
    const triggerEl = document.getElementById(buttonId);
    if (triggerEl && dropdownRef.current) {
      const { width, height } = getOriginalSize(dropdownRef.current);
      const { top, left, transformOrigin, arrowPosition } = getVerticalSidePosition(triggerEl, { width, height }, dPlacement, 8);
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
    const getNodes = (arr: DNestedChildren<T>[], level: number, subParents: DNestedChildren<T>[]): JSX.Element[] =>
      arr.map((item) => {
        const { id: itemId, label: itemLabel, type: itemType, icon: itemIcon, disabled: itemDisabled, children } = item;

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
            const sameLevelItems = getSameLevelItems(nth(subParents, -1)?.children ?? dList);
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
                    const newFocusItem = nth(getSameLevelItems(children), 0);
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
                dDisabled={itemDisabled}
                dFocusVisible={focusVisible && isFocus}
                dIcon={itemIcon}
                dLevel={level}
                onItemClick={handleItemClick}
              >
                {itemLabel}
              </DItem>
            ) : itemType === 'group' ? (
              <DGroup dId={id} dList={children && getNodes(children, level + 1, newSubParents)} dEmpty={isEmpty} dLevel={level}>
                {itemLabel}
              </DGroup>
            ) : (
              <DSub
                dId={id}
                dDisabled={itemDisabled}
                dFocusVisible={focusVisible && isFocus}
                dPopup={children && getNodes(children, 0, newSubParents)}
                dPopupVisible={!isUndefined(popupState)}
                dPopupState={popupState?.visible ?? false}
                dEmpty={isEmpty}
                dTrigger={dTrigger}
                dIcon={itemIcon}
                dLevel={level}
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
                updatePosition$={updatePosition$}
              >
                {itemLabel}
              </DSub>
            )}
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
        updatePosition$.next();
      },
    }),
    [updatePosition, updatePosition$]
  );

  return (
    <DTransition
      dIn={visible}
      dDuring={TTANSITION_DURING_POPUP}
      onEnterRendered={updatePosition}
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

        return (
          <DPopup
            dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <div
                ref={dropdownRef}
                {...restProps}
                {...restPProps}
                className={getClassName(restProps.className, `${dPrefix}dropdown`)}
                style={{
                  ...restProps.style,
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex,
                }}
                onClick={(e) => {
                  restProps.onClick?.(e);
                  pOnClick?.(e);
                }}
                onMouseEnter={(e) => {
                  restProps.onMouseEnter?.(e);
                  pOnMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                  restProps.onMouseLeave?.(e);
                  pOnMouseLeave?.(e);
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
                  aria-labelledby={buttonId}
                  aria-activedescendant={isUndefined(focusId) ? undefined : getItemId(focusId)}
                >
                  {dList.length === 0 ? <div className={`${dPrefix}dropdown__empty`}>{t('No Data')}</div> : nodes}
                </ul>
                {dArrow && <div className={`${dPrefix}dropdown__arrow`} style={arrowPosition}></div>}
              </div>
            )}
            dVisible={visible}
            dTrigger={dTrigger}
            dUpdatePosition={updatePosition}
            onVisibleChange={changeVisible}
          >
            {({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
              <DFocusVisible onFocusVisibleChange={setFocusVisible}>
                {({ fvOnFocus, fvOnBlur, fvOnKeyDown }) =>
                  React.cloneElement<React.HTMLAttributes<HTMLElement>>(children, {
                    ...children.props,
                    ...restPProps,
                    id: children.props.id ?? buttonId,
                    role: children.props.role ?? 'button',
                    'aria-haspopup': children.props['aria-haspopup'] ?? 'menu',
                    'aria-expanded': children.props['aria-expanded'] ?? visible,
                    'aria-controls': children.props['aria-controls'] ?? id,
                    onClick: (e) => {
                      children.props.onClick?.(e);
                      pOnClick?.(e);
                    },
                    onFocus: (e) => {
                      children.props.onFocus?.(e);
                      fvOnFocus(e);

                      setIsFocus(true);
                      focusFirst();
                    },
                    onBlur: (e) => {
                      children.props.onBlur?.(e);
                      fvOnBlur(e);

                      setIsFocus(false);
                      changeVisible(false);
                    },
                    onKeyDown: (e) => {
                      children.props.onKeyDown?.(e);
                      fvOnKeyDown(e);

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
                    onMouseEnter: (e) => {
                      children.props.onMouseEnter?.(e);
                      pOnMouseEnter?.(e);
                    },
                    onMouseLeave: (e) => {
                      children.props.onMouseLeave?.(e);
                      pOnMouseLeave?.(e);
                    },
                  })
                }
              </DFocusVisible>
            )}
          </DPopup>
        );
      }}
    </DTransition>
  );
}

export const DDropdown: <ID extends DId, T extends DDropdownItem<ID>>(
  props: DDropdownProps<ID, T> & React.RefAttributes<DDropdownRef>
) => ReturnType<typeof Dropdown> = React.forwardRef(Dropdown) as any;
