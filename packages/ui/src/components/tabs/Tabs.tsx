import type { DUpdater } from '../../hooks/common/useTwoWayBinding';
import type { DId, DSize } from '../../utils/global';
import type { DDropdownOption } from '../dropdown';

import { isNull, nth } from 'lodash';
import { useEffect, useId, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useTwoWayBinding,
  useAsync,
  useTranslation,
  useEventCallback,
  useIsomorphicLayoutEffect,
} from '../../hooks';
import { EllipsisOutlined, PlusOutlined } from '../../icons';
import { registerComponentMate, getClassName } from '../../utils';
import { DDropdown } from '../dropdown';
import { DTab } from './Tab';

export interface DTabsOption<ID extends DId> {
  id: ID;
  title: React.ReactNode;
  panel: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface DTabsProps<ID extends DId, T extends DTabsOption<ID>> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  dTabs: T[];
  dActive?: [ID, DUpdater<ID>?];
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dCenter?: boolean;
  dType?: 'wrap' | 'slider';
  dSize?: DSize;
  onActiveChange?: (id: ID, tab: T) => void;
  onAddClick?: () => void;
  onClose?: (id: ID, tab: T) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DTabs' });
export function DTabs<ID extends DId, T extends DTabsOption<ID>>(props: DTabsProps<ID, T>): JSX.Element | null {
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

    className,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const tabsRef = useRef<HTMLDivElement>(null);
  const tablistWrapperRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const uniqueId = useId();
  const getTabId = (id: ID) => `${dPrefix}tabs-tab-${id}-${uniqueId}`;
  const getPanelId = (id: ID) => `${dPrefix}tabs-panel-${id}-${uniqueId}`;

  const asyncCapture = useAsync();
  const [listOverflow, setListOverflow] = useState(false);
  const [dropdownList, setDropdownList] = useState<T[]>([]);
  const [scrollEnd, setScrollEnd] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>();

  const isHorizontal = dPlacement === 'top' || dPlacement === 'bottom';
  const [activeId, _changeActiveId] = useTwoWayBinding<ID, ID>(
    () => {
      for (const tab of dTabs) {
        if (!tab.disabled) {
          return tab.id;
        }
      }
      return dTabs[0].id;
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
  const updateIndicatorPosition = (id: ID) => {
    if (tablistRef.current) {
      const tablistRect = tablistRef.current.getBoundingClientRect();
      for (const tab of dTabs) {
        if (tab.id === id) {
          const el = document.getElementById(getTabId(tab.id));
          if (el) {
            const rect = el.getBoundingClientRect();
            if (isHorizontal) {
              setIndicatorStyle({
                left: rect.left - tablistRect.left,
                width: rect.width,
                opacity: 1,
              });
            } else {
              setIndicatorStyle({
                top: rect.top - tablistRect.top,
                opacity: 1,
              });
            }
          }
        }
      }
    }
  };
  const changeActiveId = (id: ID) => {
    _changeActiveId(id);

    updateIndicatorPosition(id);
  };

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

    if (!isNull(activeId)) {
      updateIndicatorPosition(activeId);
    }
  });
  useIsomorphicLayoutEffect(() => {
    refreshTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    if (tablistRef.current) {
      asyncGroup.onResize(tablistRef.current, () => {
        refreshTabs();
      });
    }

    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, refreshTabs]);

  return (
    <div
      {...restProps}
      ref={tabsRef}
      className={getClassName(className, `${dPrefix}tabs`, `${dPrefix}tabs--${dPlacement}`, {
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

            return (
              <DTab
                key={tabId}
                dId={getTabId(tabId)}
                dPanelId={getPanelId(tabId)}
                dDisabled={tabDisabled}
                dActive={tabId === activeId}
                dClosable={tabClosable}
                onActive={() => {
                  changeActiveId(tabId);
                }}
                onClose={() => {
                  onClose?.(tabId, tab);
                }}
                onKeyDown={(e) => {
                  const getTab = (next: boolean, _index = index): T | undefined => {
                    for (
                      let focusIndex = next ? _index + 1 : _index - 1, n = 0;
                      n < dTabs.length;
                      next ? focusIndex++ : focusIndex--, n++
                    ) {
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

                  switch (e.code) {
                    case 'Delete':
                      e.preventDefault();
                      if (tabClosable) {
                        focusTab(getTab(false) ?? getTab(true));
                        onClose?.(tabId, tab);
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
              </DTab>
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
                    className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tabs__button`, `${dPrefix}tabs__button--more`, {
                      'is-end': scrollEnd,
                    })}
                    style={{
                      right: isHorizontal && onAddClick ? 52 : undefined,
                      bottom: !isHorizontal && onAddClick ? 36 : undefined,
                    }}
                    aria-label={t('More')}
                  >
                    <EllipsisOutlined dSize={18} />
                  </div>
                </DDropdown>
              )}
              {onAddClick && (
                <button
                  className={getClassName(`${dPrefix}icon-button`, `${dPrefix}tabs__button`, `${dPrefix}tabs__button--add`)}
                  aria-label={t('Add')}
                  onClick={() => {
                    onAddClick?.();
                  }}
                >
                  <PlusOutlined dSize={18} />
                </button>
              )}
            </div>
          )}
          {activeId !== null && <div className={`${dPrefix}tabs__${dType ? dType + '-' : ''}indicator`} style={indicatorStyle}></div>}
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
