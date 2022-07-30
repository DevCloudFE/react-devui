import type { DId, DSize } from '../../utils/global';
import type { DDropdownOption } from '../dropdown';

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

export interface DTabOption<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  panel: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface DTabsProps<ID extends DId, T extends DTabOption<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dTabs: T[];
  dActive?: ID;
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dCenter?: boolean;
  dType?: 'wrap' | 'slider';
  dSize?: DSize;
  onActiveChange?: (id: ID, option: T) => void;
  onAddClick?: () => void;
  onClose?: (id: ID, option: T) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTabs' });
export function DTabs<ID extends DId, T extends DTabOption<ID>>(props: DTabsProps<ID, T>): JSX.Element | null {
  const {
    dTabs,
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
      for (const tab of dTabs) {
        if (!tab.disabled) {
          return tab.id;
        }
      }
    },
    dActive,
    (id) => {
      if (onActiveChange) {
        const tab = dTabs.find((t) => t.id === id);
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
        dTabs.forEach((tab) => {
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
      for (const tab of dTabs) {
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
          {dTabs.map((tab, index) => {
            const { id: tabId, title: tabTitle, disabled: tabDisabled, closable: tabClosable } = tab;

            const getTab = (next: boolean, _index = index): T | undefined => {
              for (let focusIndex = next ? _index + 1 : _index - 1, n = 0; n < dTabs.length; next ? focusIndex++ : focusIndex--, n++) {
                const t = nth(dTabs, focusIndex % dTabs.length);
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
              if (activeId === tabId) {
                let hasTab = false;
                for (let focusIndex = index + 1; focusIndex < dTabs.length; focusIndex++) {
                  const t = nth(dTabs, focusIndex);
                  if (t && !t.disabled) {
                    hasTab = true;
                    focusTab(t);
                    break;
                  }
                }
                if (!hasTab) {
                  for (let focusIndex = index - 1; focusIndex >= 0; focusIndex--) {
                    const t = nth(dTabs, focusIndex);
                    if (t && !t.disabled) {
                      focusTab(t);
                      break;
                    }
                  }
                }
              }
              onClose?.(tabId, tab);
            };

            const active = tabId === activeId;

            return (
              <div
                key={tabId}
                id={getTabId(tabId)}
                className={getClassName(`${dPrefix}tabs__tab`, {
                  'is-active': active,
                  'is-disabled': tabDisabled,
                  [`${dPrefix}tabs__tab--first`]: index === 0,
                  [`${dPrefix}tabs__tab--last`]: index === dTabs.length - 1,
                })}
                tabIndex={active && !tabDisabled ? 0 : -1}
                role="tab"
                aria-controls={getPanelId(tabId)}
                aria-selected={active}
                aria-disabled={tabDisabled}
                onClick={() => {
                  changeActiveId(tabId);
                }}
                onKeyDown={(e) => {
                  switch (e.code) {
                    case 'Delete':
                      e.preventDefault();
                      if (tabClosable) {
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
                      for (const t of dTabs) {
                        if (!t.disabled) {
                          focusTab(t);
                          break;
                        }
                      }
                      break;

                    case 'End':
                      e.preventDefault();
                      for (let index = dTabs.length - 1; index >= 0; index--) {
                        if (!dTabs[index].disabled) {
                          focusTab(dTabs[index]);
                          break;
                        }
                      }
                      break;

                    default:
                      break;
                  }
                }}
              >
                {tabTitle}
                {!tabDisabled && tabClosable && (
                  <button
                    className={`${dPrefix}tabs__close`}
                    aria-label={t('Close')}
                    onClick={(e) => {
                      e.stopPropagation();

                      closeTab();
                    }}
                  >
                    <CloseOutlined dSize={14} />
                  </button>
                )}
              </div>
            );
          })}
          {(listOverflow || onAddClick) && (
            <div className={`${dPrefix}tabs__button-container`}>
              {listOverflow && (
                <DDropdown
                  dOptions={dropdownList.map<DDropdownOption<ID>>((tab) => {
                    const { id: tabId, title: tabTitle, disabled: tabDisabled } = tab;

                    return {
                      id: tabId,
                      label: (
                        <span
                          className={getClassName(`${dPrefix}tabs__dropdown-item`, {
                            'is-active': tabId === activeId,
                          })}
                        >
                          {tabTitle}
                        </span>
                      ),
                      type: 'item',
                      disabled: tabDisabled,
                    };
                  })}
                  dPlacement={dPlacement === 'left' ? 'bottom-left' : 'bottom-right'}
                  dCloseOnClick={false}
                  onOptionClick={(id: ID) => {
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
                <button
                  className={getClassName(`${dPrefix}tabs__button`, `${dPrefix}tabs__button--add`)}
                  aria-label={t('Add')}
                  onClick={() => {
                    onAddClick?.();
                  }}
                >
                  <PlusOutlined dSize={iconSize} />
                </button>
              )}
            </div>
          )}
          <div ref={indicatorRef} className={`${dPrefix}tabs__${dType ? dType + '-' : ''}indicator`}></div>
        </div>
      </div>
      {dTabs.map((tab) => {
        const { id: tabId, panel: tabPanel } = tab;

        return (
          <div
            key={tabId}
            id={getPanelId(tabId)}
            className={`${dPrefix}tabs__tabpanel`}
            tabIndex={0}
            hidden={tabId !== activeId}
            role="tabpanel"
            aria-labelledby={getTabId(tabId)}
          >
            {tabPanel}
          </div>
        );
      })}
    </div>
  );
}
