import type { Updater } from '../../hooks/two-way-binding';
import type { DDropdownProps } from '../dropdown';
import type { DTabProps } from './Tab';
import type { Draft } from 'immer';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useTwoWayBinding, useRefCallback, useAsync, useTranslation } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DDrag, DDragPlaceholder, DDrop } from '../drag-drop';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';

export interface DTabsContextData {
  updateTabEls: (identity: string, id: string, el: HTMLElement | null) => void;
  removeTabEls: (identity: string) => void;
  tabsActiveId: string | null;
  getDotStyle: () => void;
  onActiveChange: (id: string) => void;
  onClose: (id: string) => void;
}
export const DTabsContext = React.createContext<DTabsContextData | null>(null);

export interface DTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  dActive?: [string | null, Updater<string | null>?];
  dPlacement?: 'top' | 'right' | 'bottom' | 'left';
  dCenter?: boolean;
  dType?: 'wrap' | 'slider';
  dSize?: 'smaller' | 'larger';
  dDraggable?: boolean;
  dDropdownProps?: DDropdownProps;
  dTabAriaLabel?: string;
  onActiveChange?: (id: string | null) => void;
  onAddClick?: () => void;
  onClose?: (id: string) => void;
  onOrderChange?: (order: string[]) => void;
}

export function DTabs(props: DTabsProps) {
  const {
    dActive,
    dPlacement = 'top',
    dCenter = false,
    dType,
    dSize,
    dDraggable = false,
    dDropdownProps,
    dTabAriaLabel,
    onActiveChange,
    onAddClick,
    onClose,
    onOrderChange,
    className,
    children,
    ...restProps
  } = useComponentConfig(DTabs.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [tablistEl, tablistRef] = useRefCallback();
  const [tablistWrapperEl, tablistWrapperRef] = useRefCallback();
  //#endregion

  const dataRef = useRef<{ clearTid: (() => void) | null; scrollTid: (() => void) | null }>({
    clearTid: null,
    scrollTid: null,
  });

  const [t] = useTranslation('Common');

  const asyncCapture = useAsync();
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [listOverflow, setListOverflow] = useState(true);
  const [dropdownList, setDropdownList] = useImmer<Array<React.ReactElement<DTabProps>>>([]);
  const [scrollEnd, setScrollEnd] = useState(false);
  const [tabEls, setTabEls] = useImmer(new Map<string, { id: string; el: HTMLElement }>());

  const isHorizontal = dPlacement === 'top' || dPlacement === 'bottom';
  const [activeId, changeActiveId] = useTwoWayBinding<string | null>(
    () => {
      const childs = React.Children.toArray(children) as Array<React.ReactElement<DTabProps>>;
      if (childs[0]) {
        return childs[0].props.dId;
      }

      return null;
    },
    dActive,
    onActiveChange
  );

  const updateDropdown = useCallback(() => {
    if (tablistWrapperEl) {
      const isOverflow = isHorizontal
        ? tablistWrapperEl.scrollWidth > tablistWrapperEl.clientWidth
        : tablistWrapperEl.scrollHeight > tablistWrapperEl.clientHeight;
      setListOverflow(isOverflow);

      if (isOverflow) {
        const tablistWrapperRect = tablistWrapperEl.getBoundingClientRect();
        const dropdownList: Array<React.ReactElement<DTabProps>> = [];
        React.Children.forEach(children as Array<React.ReactElement<DTabProps>>, (child) => {
          for (const { id, el } of tabEls.values()) {
            if (id === child.props.dId) {
              const elRect = el.getBoundingClientRect();
              if (isHorizontal) {
                if (elRect.right + 52 + (onAddClick ? 52 : 0) > tablistWrapperRect.right || elRect.left < tablistWrapperRect.left) {
                  dropdownList.push(child);
                }
              } else {
                if (elRect.bottom + 36 + (onAddClick ? 36 : 0) > tablistWrapperRect.bottom || elRect.top < tablistWrapperRect.top) {
                  dropdownList.push(child);
                }
              }
              break;
            }
          }
        });
        setDropdownList(dropdownList);
      }
    }
  }, [children, isHorizontal, onAddClick, setDropdownList, tabEls, tablistWrapperEl]);

  const checkScrollEnd = useCallback(() => {
    if (tablistWrapperEl) {
      setScrollEnd(
        Math.abs(
          isHorizontal
            ? tablistWrapperEl.scrollWidth - tablistWrapperEl.scrollLeft - tablistWrapperEl.clientWidth
            : tablistWrapperEl.scrollHeight - tablistWrapperEl.scrollTop - tablistWrapperEl.clientHeight
        ) < 1
      );
    }
  }, [isHorizontal, setScrollEnd, tablistWrapperEl]);

  const getDotStyle = useCallback(() => {
    dataRef.current.clearTid && dataRef.current.clearTid();
    dataRef.current.clearTid = asyncCapture.setTimeout(() => {
      dataRef.current.clearTid = null;
      if (tablistEl) {
        const tablistRect = tablistEl.getBoundingClientRect();
        const activeEl = tablistEl.querySelector(`.${dPrefix}tab.is-active`);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          if (isHorizontal) {
            setDotStyle({ left: rect.left - tablistRect.left, width: rect.width, opacity: 1 });
          }
          if (!isHorizontal) {
            setDotStyle({ top: rect.top - tablistRect.top, opacity: 1 });
          }
        } else {
          setDotStyle({});
        }
      }
    }, 20);
  }, [asyncCapture, dPrefix, isHorizontal, setDotStyle, tablistEl]);

  const handleOrderChange = useCallback(
    (order) => {
      onOrderChange?.(order);
      getDotStyle();
    },
    [getDotStyle, onOrderChange]
  );

  const handleDragStart = useCallback(() => {
    setDotStyle({});
  }, [setDotStyle]);

  const handleAddClick = useCallback(() => {
    onAddClick?.();
  }, [onAddClick]);

  const handleScroll = useCallback<React.UIEventHandler>(() => {
    checkScrollEnd();
    dataRef.current.scrollTid && dataRef.current.scrollTid();
    dataRef.current.scrollTid = asyncCapture.setTimeout(() => {
      updateDropdown();
    }, 300);
  }, [asyncCapture, checkScrollEnd, updateDropdown]);

  //#region DidUpdate
  useLayoutEffect(() => {
    setDotStyle({ transition: 'none' });
  }, [dPlacement, dType, dSize, setDotStyle]);

  useEffect(() => {
    getDotStyle();
  }, [dPlacement, dType, dSize, getDotStyle]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (tablistWrapperEl && tablistEl) {
      asyncGroup.onResize(
        tablistEl,
        () => {
          updateDropdown();
          checkScrollEnd();
        },
        false
      );
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, checkScrollEnd, tablistEl, tablistWrapperEl, updateDropdown]);
  //#endregion

  const [childs, tabpanels] = useMemo(() => {
    const _tabpanels: Array<{ dId: string; id: string; labelledby: string; node: React.ReactNode }> = [];
    const _childs = React.Children.map(children as Array<React.ReactElement<DTabProps>>, (child, index) => {
      _tabpanels.push({
        dId: child.props.dId,
        id: `${dPrefix}tabpanel-${toId(child.props.dId)}`,
        labelledby: child.props.id ?? `${dPrefix}tab-${toId(child.props.dId)}`,
        node: child.props.children,
      });

      let tabIndex = child.props.tabIndex;
      if (index === 0) {
        tabIndex = 0;
      }

      const node = React.cloneElement(child, {
        ...child.props,
        tabIndex,
      });

      return dDraggable ? <DDrag dId={child.props.dId}>{node}</DDrag> : node;
    });

    return [_childs, _tabpanels] as const;
  }, [children, dDraggable, dPrefix]);

  const stateBackflow = useMemo<Pick<DTabsContextData, 'updateTabEls' | 'removeTabEls'>>(
    () => ({
      updateTabEls: (identity, id, el) => {
        if (el) {
          setTabEls((draft) => {
            draft.set(identity, { id, el: el as Draft<HTMLElement> });
          });
        }
      },
      removeTabEls: (identity) => {
        setTabEls((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setTabEls]
  );
  const contextValue = useMemo<DTabsContextData>(
    () => ({
      ...stateBackflow,
      tabsActiveId: activeId,
      getDotStyle,
      onActiveChange: (id) => {
        changeActiveId(id);
      },
      onClose: (id) => {
        if (activeId === id) {
          changeActiveId(null);
        }
        onClose?.(id);
      },
    }),
    [activeId, changeActiveId, getDotStyle, onClose, stateBackflow]
  );

  return (
    <DTabsContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}tabs`, `${dPrefix}tabs--${dPlacement}`, {
          [`${dPrefix}tabs--${dType}`]: dType,
          [`${dPrefix}tabs--${dSize}`]: dSize,
          [`${dPrefix}tabs--center`]: dCenter,
        })}
      >
        <div ref={tablistWrapperRef} className={`${dPrefix}tabs__tablist-wrapper`} onScroll={handleScroll}>
          <div
            ref={tablistRef}
            className={`${dPrefix}tabs__tablist`}
            role="tablist"
            aria-label={dTabAriaLabel}
            aria-orientation={isHorizontal ? 'horizontal' : 'vertical'}
          >
            {dDraggable ? (
              <DDrop
                dContainer={tablistWrapperEl}
                dDirection={isHorizontal ? 'horizontal' : 'vertical'}
                dPlaceholder={<DDragPlaceholder />}
                onOrderChange={handleOrderChange}
                onDragStart={handleDragStart}
              >
                {childs}
              </DDrop>
            ) : (
              childs
            )}
            {(listOverflow || onAddClick) && (
              <div className={`${dPrefix}tabs__button-container`}>
                {listOverflow && (
                  <DDropdown
                    dTriggerNode={
                      <div
                        className={getClassName(`${dPrefix}tabs__button`, `${dPrefix}tabs__button--more`, {
                          'is-end': scrollEnd,
                        })}
                        style={{
                          right: isHorizontal && onAddClick ? 52 : undefined,
                          bottom: !isHorizontal && onAddClick ? 36 : undefined,
                        }}
                        tabIndex={-1}
                        aria-label={t('More')}
                      >
                        <DIcon viewBox="64 64 896 896" dSize={18}>
                          <path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"></path>
                        </DIcon>
                      </div>
                    }
                    dCloseOnItemClick={false}
                    dPlacement={dPlacement === 'left' ? 'bottom-left' : 'bottom-right'}
                    {...dDropdownProps}
                  >
                    {dropdownList.map((item) => (
                      <DDropdownItem key={item.props.dId} dId={item.props.dId}>
                        {React.cloneElement(item, {
                          ...item.props,
                          __dropdown: true,
                        })}
                      </DDropdownItem>
                    ))}
                  </DDropdown>
                )}
                {onAddClick && (
                  <div
                    className={getClassName(`${dPrefix}tabs__button`, `${dPrefix}tabs__button--add`)}
                    role="button"
                    tabIndex={-1}
                    aria-label={t('Add')}
                    onClick={handleAddClick}
                  >
                    <DIcon viewBox="64 64 896 896" dSize={18}>
                      <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                      <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                    </DIcon>
                  </div>
                )}
              </div>
            )}
            {activeId === null ? null : dType === 'wrap' ? (
              <div className={`${dPrefix}tabs__wrap-indicator`} style={dotStyle}></div>
            ) : dType === 'slider' ? (
              <div className={`${dPrefix}tabs__slider-indicator`} style={dotStyle}></div>
            ) : (
              <div className={`${dPrefix}tabs__indicator`} style={dotStyle}></div>
            )}
          </div>
        </div>
        {tabpanels.map((tabpanel) => (
          <div
            className={`${dPrefix}tabs__tabpanel`}
            key={tabpanel.dId}
            id={tabpanel.id}
            tabIndex={0}
            role="tabpanel"
            hidden={tabpanel.dId !== activeId}
            aria-labelledby={tabpanel.labelledby}
          >
            {tabpanel.node}
          </div>
        ))}
      </div>
    </DTabsContext.Provider>
  );
}
