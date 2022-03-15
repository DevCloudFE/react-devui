import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DId, DNestedChildren } from '../../types';

import { isNull, isUndefined, nth } from 'lodash';
import React, { useId, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useTwoWayBinding, useFocusVisible } from '../../hooks';
import { findNested, registerComponentMate, getClassName } from '../../utils';
import { useNestedPopup } from '../_popup';
import { DCollapseTransition } from '../_transition';
import { DMenuGroup } from './MenuGroup';
import { DMenuItem } from './MenuItem';
import { DMenuSub } from './MenuSub';
import { checkEnableOption, getOptions } from './utils';

export type DMenuMode = 'horizontal' | 'vertical' | 'popup' | 'icon';

export interface DMenuOption<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  type: 'item' | 'group' | 'sub';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DMenuProps<ID extends DId, T extends DMenuOption<ID>> extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  dOptions: DNestedChildren<T>[];
  dActive?: [ID | null, DUpdater<ID>?];
  dExpands?: [ID[], DUpdater<ID[]>?];
  dMode?: DMenuMode;
  dExpandOne?: boolean;
  dExpandTrigger?: 'hover' | 'click';
  onActiveChange?: (id: ID, option: DNestedChildren<T>) => void;
  onExpandsChange?: (ids: ID[], options: DNestedChildren<T>[]) => void;
}

const TTANSITION_DURING = 200;
const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DMenu' });
export function DMenu<ID extends DId, T extends DMenuOption<ID>>(props: DMenuProps<ID, T>): JSX.Element | null {
  const {
    className,
    style,
    dOptions,
    dActive,
    dExpands,
    dMode = 'vertical',
    dExpandOne = false,
    dExpandTrigger,
    onActiveChange,
    onExpandsChange,
    onMouseDown,
    onMouseUp,
    onFocus,
    onBlur,
    onKeyDown,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const navRef = useRef<HTMLElement>(null);
  //#endregion

  const uniqueId = useId();
  const getOptionId = (id: ID) => `${dPrefix}menu-option-${uniqueId}-${id}`;

  const [activeId, changeActiveId] = useTwoWayBinding<ID | null, ID>(null, dActive, (id) => {
    if (onActiveChange) {
      onActiveChange(id, findNested(dOptions, (option) => option.id === id) as T);
    }
  });
  const activeIds = (() => {
    let ids: ID[] | undefined;
    const reduceArr = (arr: DNestedChildren<T>[], subParent: ID[] = []) => {
      for (const item of arr) {
        if (ids) {
          break;
        }
        if (item.children) {
          reduceArr(item.children, item.type === 'sub' ? subParent.concat([item.id]) : subParent);
        } else if (item.id === activeId) {
          ids = subParent.concat([item.id]);
        }
      }
    };
    if (!isNull(activeId)) {
      reduceArr(dOptions);
    }

    return ids ?? [];
  })();

  const [expanoptionIds, changeExpanoptionIds] = useTwoWayBinding<ID[]>([], dExpands, (ids) => {
    if (onExpandsChange) {
      let length = ids.length;
      const options: DNestedChildren<T>[] = [];
      const reduceArr = (arr: DNestedChildren<T>[]) => {
        for (const item of arr) {
          if (length === 0) {
            break;
          }

          if (item.children) {
            reduceArr(item.children);
          } else {
            const index = ids.findIndex((id) => id === item.id);
            if (index !== -1) {
              options[index] = item;
              length -= 1;
            }
          }
        }
      };
      reduceArr(dOptions);

      onExpandsChange(ids, options);
    }
  });
  const { popupIds, setPopupIds, addPopupId, removePopupId } = useNestedPopup<ID>();
  const [focusIds, setFocusIds] = useState<ID[]>([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const { fvOnFocus, fvOnBlur, fvOnKeyDown } = useFocusVisible(setIsFocusVisible);
  const focusId = (() => {
    if (isFocus) {
      if (dMode === 'vertical') {
        return nth(focusIds, -1);
      } else {
        let id: ID | undefined;
        for (const [index, focusId] of focusIds.entries()) {
          id = focusId;
          if (nth(popupIds, index)?.id !== focusId) {
            break;
          }
        }
        return id;
      }
    }
  })();

  const initFocus = () => {
    let firstId: ID | undefined;
    const ids: ID[] = [];
    const reduceArr = (arr: DNestedChildren<T>[]) => {
      for (const item of arr) {
        if (ids.length === 1) {
          break;
        }

        if ((item.type === 'group' || (dMode === 'vertical' && item.type === 'sub' && expanoptionIds.includes(item.id))) && item.children) {
          reduceArr(item.children);
        } else if (checkEnableOption(item)) {
          if (isUndefined(firstId)) {
            firstId = item.id;
          }
          if (activeIds.includes(item.id)) {
            ids.push(item.id);
          }
        }
      }
    };
    reduceArr(dOptions);
    setFocusIds(ids.length === 0 ? (isUndefined(firstId) ? [] : [firstId]) : ids);
  };

  const preventBlur: React.MouseEventHandler<HTMLElement> = (e) => {
    if (isFocus && e.button === 0) {
      e.preventDefault();
    }
  };

  let handleKeyDown: React.KeyboardEventHandler<HTMLElement> | undefined;
  const optionNodes = (() => {
    const getNodes = (arr: DNestedChildren<T>[], level: number, subParents: DNestedChildren<T>[], inNav = false): JSX.Element[] => {
      const posinset = new Map<ID, [number, number]>();
      let noGroup: DNestedChildren<T>[] = [];
      for (const option of arr) {
        if (option.type === 'group') {
          for (const [i, o] of noGroup.entries()) {
            posinset.set(o.id, [i, noGroup.length]);
          }
          noGroup = [];
        } else {
          noGroup.push(option);
        }
      }
      for (const [i, o] of noGroup.entries()) {
        posinset.set(o.id, [i, noGroup.length]);
      }

      return arr.map((option) => {
        const { id: optionId, title: optionTitle, type: optionType, icon: optionIcon, disabled: optionDisabled, children } = option;

        const _subParents = optionType === 'sub' ? subParents.concat([option]) : subParents;
        const id = getOptionId(optionId);
        const isExpand = expanoptionIds.includes(optionId);
        const isFocus = optionId === focusId;
        const isEmpty = !(children && children.length > 0);
        const popupState = popupIds.find((v) => v.id === optionId);

        let step = 20;
        let space = 16;
        if (dMode === 'horizontal' && inNav) {
          space = 20;
        }
        if (dMode !== 'vertical' && !inNav) {
          step = 12;
          space = 10;
        }

        const handleItemClick = () => {
          changeActiveId(optionId);
          setFocusIds(subParents.map((o) => o.id).concat([optionId]));
        };

        const handleSubExpand = (sameLevelOptions: T[]) => {
          if (isExpand) {
            changeExpanoptionIds((draft) => {
              const index = draft.findIndex((id) => id === optionId);
              draft.splice(index, 1);
            });
          } else {
            if (dExpandOne) {
              const ids = expanoptionIds.filter((id) => sameLevelOptions.findIndex((o) => o.id === id) === -1);
              ids.push(optionId);
              changeExpanoptionIds(ids);
            } else {
              changeExpanoptionIds((draft) => {
                draft.push(optionId);
              });
            }
          }
        };

        if (isFocus) {
          handleKeyDown = (e) => {
            const sameLevelOptions = getOptions(nth(subParents, -1)?.children ?? dOptions);
            const focusOption = (o?: T) => {
              if (o) {
                setFocusIds(subParents.map((o) => o.id).concat([o.id]));
              }
            };

            if (dMode === 'horizontal' && inNav) {
              switch (e.code) {
                case 'ArrowUp':
                  e.code = 'ArrowLeft';
                  break;

                case 'ArrowLeft':
                  e.code = 'ArrowUp';
                  break;

                case 'ArrowDown':
                  e.code = 'ArrowRight';
                  break;

                case 'ArrowRight':
                  e.code = 'ArrowDown';
                  break;

                default:
                  break;
              }
            }

            switch (e.code) {
              case 'ArrowUp': {
                e.preventDefault();
                const index = sameLevelOptions.findIndex((o) => o.id === optionId);
                const o = nth(sameLevelOptions, index - 1);
                focusOption(o);
                if (o && nth(popupIds, -1)?.id === optionId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowDown': {
                e.preventDefault();
                const index = sameLevelOptions.findIndex((o) => o.id === optionId);
                const o = nth(sameLevelOptions, (index + 1) % sameLevelOptions.length);
                focusOption(o);
                if (o && nth(popupIds, -1)?.id === optionId) {
                  setPopupIds(popupIds.slice(0, -1));
                }
                break;
              }

              case 'ArrowLeft': {
                e.preventDefault();
                if (dMode !== 'vertical') {
                  setPopupIds(popupIds.slice(0, -1));
                }
                const ids = subParents.map((item) => item.id);
                if (ids.length > 0) {
                  setFocusIds(ids);
                }
                break;
              }

              case 'ArrowRight':
                e.preventDefault();
                if (optionType === 'sub') {
                  if (dMode === 'vertical') {
                    if (!isExpand) {
                      handleSubExpand(sameLevelOptions);
                    }
                  } else {
                    addPopupId(optionId);
                  }
                  if (children) {
                    const o = nth(getOptions(children), 0);
                    if (o) {
                      setFocusIds(_subParents.map((o) => o.id).concat([o.id]));
                    }
                  }
                }
                break;

              case 'Home':
                e.preventDefault();
                focusOption(nth(sameLevelOptions, 0));
                break;

              case 'End':
                e.preventDefault();
                focusOption(nth(sameLevelOptions, -1));
                break;

              case 'Enter':
              case 'Space':
                e.preventDefault();
                if (optionType === 'item') {
                  handleItemClick();
                } else if (optionType === 'sub') {
                  if (dMode === 'vertical') {
                    handleSubExpand(sameLevelOptions);
                  } else {
                    addPopupId(optionId);
                  }
                }
                break;

              default:
                break;
            }
          };
        }

        return (
          <React.Fragment key={optionId}>
            {optionType === 'item' ? (
              <DMenuItem
                id={id}
                disabled={optionDisabled}
                dPosinset={posinset.get(optionId)!}
                dMode={dMode}
                dInNav={inNav}
                dActive={activeId === optionId}
                dFocusVisible={isFocusVisible && isFocus}
                dIcon={optionIcon}
                dStep={step}
                dSpace={space}
                dLevel={level}
                onClick={handleItemClick}
              >
                {optionTitle}
              </DMenuItem>
            ) : optionType === 'group' ? (
              <DMenuGroup
                id={id}
                dOptions={children && getNodes(children, level + 1, _subParents)}
                dEmpty={isEmpty}
                dStep={step}
                dSpace={space}
                dLevel={level}
              >
                {optionTitle}
              </DMenuGroup>
            ) : (
              <DMenuSub
                id={id}
                disabled={optionDisabled}
                dPosinset={posinset.get(optionId)!}
                dMode={dMode}
                dInNav={inNav}
                dActive={(dMode === 'vertical' ? !isExpand : isUndefined(popupState)) && activeIds.includes(optionId)}
                dExpand={isExpand}
                dFocusVisible={isFocusVisible && isFocus}
                dList={children && getNodes(children, dMode === 'vertical' ? level + 1 : 0, _subParents)}
                dPopupVisible={dMode === 'vertical' ? false : !isUndefined(popupState)}
                dPopupState={popupState?.visible ?? false}
                dEmpty={isEmpty}
                dTrigger={dExpandTrigger ?? (dMode === 'vertical' ? 'click' : 'hover')}
                dIcon={optionIcon}
                dStep={step}
                dSpace={space}
                dLevel={level}
                onVisibleChange={(visible) => {
                  if (visible) {
                    if (subParents.length === 0) {
                      setPopupIds([{ id: optionId, visible: true }]);
                    } else {
                      addPopupId(optionId);
                    }
                  } else {
                    removePopupId(optionId);
                  }
                }}
                onClick={() => {
                  if (!optionDisabled) {
                    setFocusIds(subParents.map((o) => o.id).concat([optionId]));

                    if (dMode === 'vertical') {
                      const sameLevelOptions = getOptions(nth(subParents, -1)?.children ?? dOptions);
                      handleSubExpand(sameLevelOptions);
                    }
                  }
                }}
              >
                {optionTitle}
              </DMenuSub>
            )}
          </React.Fragment>
        );
      });
    };

    return getNodes(dOptions, 0, [], true);
  })();

  return (
    <DCollapseTransition
      dRef={navRef}
      dSize={80}
      dIn={dMode !== 'icon'}
      dDuring={TTANSITION_DURING}
      dHorizontal
      dStyles={{
        entering: { transition: `width ${TTANSITION_DURING}ms linear` },
        leaving: { transition: `width ${TTANSITION_DURING}ms linear` },
      }}
    >
      {(collapseStyle) => (
        <nav
          {...restProps}
          ref={navRef}
          className={getClassName(className, `${dPrefix}menu`, {
            [`${dPrefix}menu--horizontal`]: dMode === 'horizontal',
          })}
          style={{
            ...style,
            ...collapseStyle,
          }}
          tabIndex={0}
          role="menubar"
          aria-orientation={dMode === 'horizontal' ? 'horizontal' : 'vertical'}
          aria-activedescendant={isUndefined(focusId) ? undefined : getOptionId(focusId)}
          onMouseDown={(e) => {
            onMouseDown?.(e);

            preventBlur(e);
          }}
          onMouseUp={(e) => {
            onMouseUp?.(e);

            preventBlur(e);
          }}
          onFocus={(e) => {
            onFocus?.(e);
            fvOnFocus();

            setIsFocus(true);
            initFocus();
          }}
          onBlur={(e) => {
            onBlur?.(e);
            fvOnBlur();

            setIsFocus(false);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            fvOnKeyDown(e);

            handleKeyDown?.(e);
          }}
        >
          {optionNodes}
        </nav>
      )}
    </DCollapseTransition>
  );
}
