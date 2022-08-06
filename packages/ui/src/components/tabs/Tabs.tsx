import type { DId, DSize } from '../../utils/global';
import type { DDropdownItem } from '../dropdown';

import { nth } from 'lodash';
import { useEffect, useId, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useAsync,
  useTranslation,
  useEventCallback,
  useIsomorphicLayoutEffect,
  useDValue,
} from '../../hooks';
import { CloseOutlined, EllipsisOutlined, PlusOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DDropdown } from '../dropdown';

export interface DTabItem<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  panel: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface DTabsProps<ID extends DId, T extends DTabItem<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dList: T[];
  dActive?: ID;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dCenter?: boolean;
  dType?: 'wrap' | 'slider';
  dSize?: DSize;
  onActiveChange?: (id: ID, item: T) => void;
  onAddClick?: () => void;
  onClose?: (id: ID, item: T) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTabs' });
export function DTabs<ID extends DId, T extends DTabItem<ID>>(props: DTabsProps<ID, T>): JSX.Element | null {
  const {
    dList,
    dActive,
    dPlacement = 'top',
    dCenter = false,
    dType,
    dSize,
    onActiveChange,
    onAddClick,
    onClose,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const tabsRef = useRef<HTMLDivElement>(null);
  const tablistWrapperRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  //#endregion

  const [t] = useTranslation();

  const uniqueId = useId();
  const getTabId = (id: ID) => `${dPrefix}tabs-tab-${id}-${uniqueId}`;
  const getPanelId = (id: ID) => `${dPrefix}tabs-panel-${id}-${uniqueId}`;

  const asyncCapture = useAsync();
  const [listOverflow, setListOverflow] = useState(false);
  const [dropdownList, setDropdownList] = useState<T[]>([]);
  const [scrollEnd, setScrollEnd] = useState(false);

  const iconSize = dSize === 'smaller' ? 16 : dSize === 'larger' ? 20 : 18;

  const isHorizontal = dPlacement === 'top' || dPlacement === 'bottom';
  const [activeId, changeActiveId] = useDValue<ID | undefined, ID>(
    () => {
      for (const tab of dList) {
        if (!tab.disabled) {
          return tab.id;
        }
      }
    },
    dActive,
    (id) => {
      if (onActiveChange) {
        const tab = dList.find((t) => t.id === id);
        if (tab) {
          onActiveChange(id, tab);
        }
      }
    }
  );

  const refreshTabs = useEventCallback(() => {
    const tablistWrapperEl = tablistWrapperRef.current;
    if (tablistWrapperEl) {
      const isOverflow = isHorizontal
        ? tablistWrapperEl.scrollWidth > tablistWrapperEl.clientWidth
        : tablistWrapperEl.scrollHeight > tablistWrapperEl.clientHeight;
      setListOverflow(isOverflow);
      setScrollEnd(
        Math.abs(
          isHorizontal
            ? tablistWrapperEl.scrollWidth - tablistWrapperEl.scrollLeft - tablistWrapperEl.clientWidth
            : tablistWrapperEl.scrollHeight - tablistWrapperEl.scrollTop - tablistWrapperEl.clientHeight
        ) < 1
      );

      if (isOverflow) {
        const tablistWrapperRect = tablistWrapperEl.getBoundingClientRect();
        const dropdownList: T[] = [];
        dList.forEach((tab) => {
          const el = document.getElementById(getTabId(tab.id));
          if (el) {
            const rect = el.getBoundingClientRect();
            if (isHorizontal) {
              if (rect.right + 52 + (onAddClick ? 52 : 0) > tablistWrapperRect.right || rect.left < tablistWrapperRect.left) {
                dropdownList.push(tab);
              }
            } else {
              if (rect.bottom + 36 + (onAddClick ? 36 : 0) > tablistWrapperRect.bottom || rect.top < tablistWrapperRect.top) {
                dropdownList.push(tab);
              }
            }
          }
        });

        setDropdownList(dropdownList);
      }
    }
  });
  useIsomorphicLayoutEffect(() => {
    refreshTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (tablistWrapperRef.current) {
      asyncGroup.onResize(tablistWrapperRef.current, () => {
        refreshTabs();
      });
    }

    if (tablistRef.current) {
      asyncGroup.onResize(tablistRef.current, () => {
        refreshTabs();
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, refreshTabs]);

  useEffect(() => {
    if (tablistRef.current && indicatorRef.current) {
      const tablistRect = tablistRef.current.getBoundingClientRect();
      for (const tab of dList) {
        if (tab.id === activeId) {
          const el = document.getElementById(getTabId(tab.id));
          if (el) {
            const rect = el.getBoundingClientRect();
            if (isHorizontal) {
              indicatorRef.current.style.cssText = `left:${rect.left - tablistRect.left}px;width:${rect.width}px;opacity:1;`;
            } else {
              indicatorRef.current.style.cssText = `top:${rect.top - tablistRect.top}px;opacity:1;`;
            }
          }
        }
      }
    }
  });

  return (
    <div
      {...restProps}
      ref={tabsRef}
      className={getClassName(restProps.className, `${dPrefix}tabs`, `${dPrefix}tabs--${dPlacement}`, {
        [`${dPrefix}tabs--${dType}`]: dType,
        [`${dPrefix}tabs--${dSize}`]: dSize,
        [`${dPrefix}tabs--center`]: dCenter,
      })}
    >
      <div
        ref={tablistWrapperRef}
        className={`${dPrefix}tabs__tablist-wrapper`}
        onScroll={() => {
          refreshTabs();
        }}
      >
        <div
          ref={tablistRef}
          className={`${dPrefix}tabs__tablist`}
          role="tablist"
          aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
        >
          {dList.map((item, index) => {
            const { id: itemId, title: itemTitle, disabled: itemDisabled, closable: itemClosable } = item;

            const getTab = (next: boolean, _index = index): T | undefined => {
              for (let focusIndex = next ? _index + 1 : _index - 1, n = 0; n < dList.length; next ? focusIndex++ : focusIndex--, n++) {
                const t = nth(dList, focusIndex % dList.length);
                if (t && !t.disabled) {
                  return t;
                }
              }
            };

            const focusTab = (t?: T) => {
              if (t) {
                changeActiveId(t.id);

                const el = document.getElementById(getTabId(t.id));
                if (el) {
                  el.focus();
                }
              }
            };

            const closeTab = () => {
              if (activeId === itemId) {
                let hasTab = false;
                for (let focusIndex = index + 1; focusIndex < dList.length; focusIndex++) {
                  const t = nth(dList, focusIndex);
                  if (t && !t.disabled) {
                    hasTab = true;
                    focusTab(t);
                    break;
                  }
                }
                if (!hasTab) {
                  for (let focusIndex = index - 1; focusIndex >= 0; focusIndex--) {
                    const t = nth(dList, focusIndex);
                    if (t && !t.disabled) {
                      focusTab(t);
                      break;
                    }
                  }
                }
              }
              onClose?.(itemId, item);
            };

            const active = itemId === activeId;

            return (
              <div
                key={itemId}
                id={getTabId(itemId)}
                className={getClassName(`${dPrefix}tabs__tab`, {
                  'is-active': active,
                  'is-disabled': itemDisabled,
                  [`${dPrefix}tabs__tab--first`]: index === 0,
                  [`${dPrefix}tabs__tab--last`]: index === dList.length - 1,
                })}
                tabIndex={active && !itemDisabled ? 0 : -1}
                role="tab"
                aria-controls={getPanelId(itemId)}
                aria-selected={active}
                aria-disabled={itemDisabled}
                onClick={() => {
                  changeActiveId(itemId);
                }}
                onKeyDown={(e) => {
                  switch (e.code) {
                    case 'Delete':
                      e.preventDefault();
                      if (itemClosable) {
                        closeTab();
                      }
                      break;

                    case 'ArrowLeft':
                      e.preventDefault();
                      if (dPlacement === 'top' || dPlacement === 'bottom') {
                        focusTab(getTab(false));
                      }
                      break;

                    case 'ArrowRight':
                      e.preventDefault();
                      if (dPlacement === 'top' || dPlacement === 'bottom') {
                        focusTab(getTab(true));
                      }
                      break;

                    case 'ArrowUp':
                      e.preventDefault();
                      if (dPlacement === 'left' || dPlacement === 'right') {
                        focusTab(getTab(false));
                      }
                      break;

                    case 'ArrowDown':
                      e.preventDefault();
                      if (dPlacement === 'left' || dPlacement === 'right') {
                        focusTab(getTab(true));
                      }
                      break;

                    case 'Home':
                      e.preventDefault();
                      for (const t of dList) {
                        if (!t.disabled) {
                          focusTab(t);
                          break;
                        }
                      }
                      break;

                    case 'End':
                      e.preventDefault();
                      for (let index = dList.length - 1; index >= 0; index--) {
                        if (!dList[index].disabled) {
                          focusTab(dList[index]);
                          break;
                        }
                      }
                      break;

                    default:
                      break;
                  }
                }}
              >
                {itemTitle}
                {!itemDisabled && itemClosable && (
                  <div
                    className={`${dPrefix}tabs__close`}
                    role="button"
                    aria-label={t('Close')}
                    onClick={(e) => {
                      e.stopPropagation();

                      closeTab();
                    }}
                  >
                    <CloseOutlined dSize={14} />
                  </div>
                )}
              </div>
            );
          })}
          {(listOverflow || onAddClick) && (
            <div className={`${dPrefix}tabs__button-container`}>
              {listOverflow && (
                <DDropdown
                  dList={dropdownList.map<DDropdownItem<ID>>((tab) => {
                    const { id: itemId, title: itemTitle, disabled: itemDisabled } = tab;

                    return {
                      id: itemId,
                      label: (
                        <span
                          className={getClassName(`${dPrefix}tabs__dropdown-item`, {
                            'is-active': itemId === activeId,
                          })}
                        >
                          {itemTitle}
                        </span>
                      ),
                      type: 'item',
                      disabled: itemDisabled,
                    };
                  })}
                  dPlacement={dPlacement === 'left' ? 'bottom-left' : 'bottom-right'}
                  dCloseOnClick={false}
                  onItemClick={(id: ID) => {
                    changeActiveId(id);
                  }}
                >
                  <div
                    className={getClassName(`${dPrefix}tabs__button`, `${dPrefix}tabs__button--more`, {
                      'is-end': scrollEnd,
                    })}
                    style={{
                      right: isHorizontal && onAddClick ? 52 : undefined,
                      bottom: !isHorizontal && onAddClick ? 36 : undefined,
                    }}
                    aria-label={t('More')}
                  >
                    <EllipsisOutlined dSize={iconSize} />
                  </div>
                </DDropdown>
              )}
              {onAddClick && (
                <div
                  className={getClassName(`${dPrefix}tabs__button`, `${dPrefix}tabs__button--add`)}
                  role="button"
                  aria-label={t('Add')}
                  onClick={() => {
                    onAddClick?.();
                  }}
                >
                  <PlusOutlined dSize={iconSize} />
                </div>
              )}
            </div>
          )}
          <div ref={indicatorRef} className={`${dPrefix}tabs__${dType ? dType + '-' : ''}indicator`}></div>
        </div>
      </div>
      {dList.map((item) => {
        const { id: itemId, panel: itemPanel } = item;

        return (
          <div
            key={itemId}
            id={getPanelId(itemId)}
            className={`${dPrefix}tabs__tabpanel`}
            tabIndex={0}
            hidden={itemId !== activeId}
            role="tabpanel"
            aria-labelledby={getTabId(itemId)}
          >
            {itemPanel}
          </div>
        );
      })}
    </div>
  );
}
