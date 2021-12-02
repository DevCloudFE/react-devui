import type { Updater } from '../../hooks/immer';
import type { DDropdownProps } from '../dropdown';
import type { DTabProps } from './Tab';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { useDPrefixConfig, useDComponentConfig, useImmer, useTwoWayBinding, useRefCallback, useAsync } from '../../hooks';
import { getClassName, toId } from '../../utils';
import { DDrag, DDragPlaceholder, DDrop } from '../drag-drop';
import { DDropdown, DDropdownItem } from '../dropdown';
import { DIcon } from '../icon';

export interface DTabsContextData {
  tabsActiveId: string | null;
  tabsCloseIds: string[];
  getDotStyle: () => void;
  onActiveChange: (id: string) => void;
  onTabChange: (id: string, el?: HTMLElement | null) => void;
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
  } = useDComponentConfig('menu', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [tablistEl, tablistRef] = useRefCallback();
  const [tablistWrapperEl, tablistWrapperRef] = useRefCallback();
  //#endregion

  const dataRef = useRef<{ clearTid: (() => void) | null; tabEls: Map<string, HTMLElement | null> }>({
    clearTid: null,
    tabEls: new Map(),
  });

  const asyncCapture = useAsync();
  const [dotStyle, setDotStyle] = useImmer<React.CSSProperties>({});
  const [listOverflow, setListOverflow] = useImmer(true);
  const [dropdownList, setDropdownList] = useImmer<Array<React.ReactElement<DTabProps>>>([]);
  const [scrollEnd, setScrollEnd] = useImmer(false);
  const [closeIds, setCloseIds] = useImmer<string[]>([]);

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
      const isOverflow =
        dPlacement === 'top' || dPlacement === 'bottom'
          ? tablistWrapperEl.scrollWidth > tablistWrapperEl.clientWidth
          : tablistWrapperEl.scrollHeight > tablistWrapperEl.clientHeight;
      setListOverflow(isOverflow);

      if (isOverflow) {
        const tablistWrapperRect = tablistWrapperEl.getBoundingClientRect();
        const dropdownList: Array<React.ReactElement<DTabProps>> = [];
        React.Children.forEach(children as Array<React.ReactElement<DTabProps>>, (child) => {
          const el = dataRef.current.tabEls.get(child.props.dId);
          if (el) {
            const elRect = el.getBoundingClientRect();
            if (dPlacement === 'top' || dPlacement === 'bottom') {
              if (elRect.right + 52 + (onAddClick ? 52 : 0) > tablistWrapperRect.right || elRect.right < tablistWrapperRect.left) {
                dropdownList.push(child);
              }
            } else {
              if (elRect.bottom + 36 + (onAddClick ? 36 : 0) > tablistWrapperRect.bottom || elRect.bottom < tablistWrapperRect.top) {
                dropdownList.push(child);
              }
            }
          }
        });
        setDropdownList(dropdownList);
      }
    }
  }, [children, dPlacement, onAddClick, setDropdownList, setListOverflow, tablistWrapperEl]);

  const getDotStyle = useCallback(() => {
    dataRef.current.clearTid && dataRef.current.clearTid();
    dataRef.current.clearTid = asyncCapture.setTimeout(() => {
      dataRef.current.clearTid = null;
      if (tablistEl) {
        const tablistRect = tablistEl.getBoundingClientRect();
        const activeEl = tablistEl.querySelector(`.${dPrefix}tab.is-active`);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          if (dPlacement === 'top' || dPlacement === 'bottom') {
            setDotStyle({ left: rect.left - tablistRect.left, width: rect.width, opacity: 1 });
          }
          if (dPlacement === 'left' || dPlacement === 'right') {
            setDotStyle({ top: rect.top - tablistRect.top, opacity: 1 });
          }
        } else {
          setDotStyle({});
        }
      }
    }, 20);
  }, [asyncCapture, dPlacement, dPrefix, setDotStyle, tablistEl]);

  const handleOrderChange = useCallback(
    (order) => {
      onOrderChange?.(order);
      getDotStyle();
    },
    [getDotStyle, onOrderChange]
  );

  const handleAddClick = useCallback(() => {
    onAddClick?.();
  }, [onAddClick]);

  const handleScroll = useCallback<React.UIEventHandler>(
    (e) => {
      setScrollEnd(
        Math.abs(
          dPlacement === 'top' || dPlacement === 'bottom'
            ? e.currentTarget.scrollWidth - e.currentTarget.scrollLeft - e.currentTarget.clientWidth
            : e.currentTarget.scrollHeight - e.currentTarget.scrollTop - e.currentTarget.clientHeight
        ) < 1
      );

      updateDropdown();
    },
    [dPlacement, setScrollEnd, updateDropdown]
  );

  //#region DidUpdate
  useLayoutEffect(() => {
    setDotStyle({ transition: 'none' });
  }, [dPlacement, dType, dSize, setDotStyle]);

  useEffect(() => {
    getDotStyle();
  }, [dPlacement, dType, dSize, closeIds, getDotStyle]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (tablistWrapperEl && tablistEl) {
      asyncGroup.onResize(tablistEl, updateDropdown, false);
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, tablistEl, tablistWrapperEl, updateDropdown]);
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

  const contextValue = useMemo<DTabsContextData>(
    () => ({
      tabsActiveId: activeId,
      tabsCloseIds: closeIds,
      getDotStyle,
      onActiveChange: (id) => {
        changeActiveId(id);
      },
      onTabChange: (id, el) => {
        if (isUndefined(el)) {
          dataRef.current.tabEls.delete(id);
        } else {
          dataRef.current.tabEls.set(id, el);
        }
      },
      onClose: (id) => {
        if (activeId === id) {
          changeActiveId(null);
        }
        onClose?.(id);
        setCloseIds((draft) => {
          draft.push(id);
        });
      },
    }),
    [activeId, changeActiveId, closeIds, getDotStyle, onClose, setCloseIds]
  );

  return (
    <DTabsContext.Provider value={contextValue}>
      <div
        {...restProps}
        className={getClassName(className, `${dPrefix}tabs`, `${dPrefix}tabs--${dPlacement}`, {
          'is-center': dCenter,
          [`${dPrefix}tabs--${dType}`]: dType,
          [`${dPrefix}tabs--${dSize}`]: dSize,
        })}
      >
        <div ref={tablistWrapperRef} className={`${dPrefix}tabs__tablist-wrapper`} onScroll={handleScroll}>
          <div
            ref={tablistRef}
            className={`${dPrefix}tabs__tablist`}
            role="tablist"
            aria-label={dTabAriaLabel}
            aria-orientation={dPlacement === 'top' || dPlacement === 'bottom' ? 'horizontal' : 'vertical'}
          >
            {dDraggable ? (
              <DDrop
                dContainer={tablistWrapperEl}
                dDirection={dPlacement === 'left' || dPlacement === 'right' ? 'vertical' : 'horizontal'}
                dPlaceholder={<DDragPlaceholder className={`${dPrefix}tabs__drop-placeholder`} />}
                onOrderChange={handleOrderChange}
              >
                {childs}
              </DDrop>
            ) : (
              childs
            )}
            {listOverflow && (
              <DDropdown
                className={`${dPrefix}tabs__dropdown`}
                dTriggerNode={
                  <div
                    className={getClassName(`${dPrefix}tabs__button`, 'is-more', {
                      'is-end': scrollEnd,
                    })}
                    style={{
                      right: (dPlacement === 'top' || dPlacement === 'bottom') && onAddClick ? 52 : undefined,
                      bottom: (dPlacement === 'left' || dPlacement === 'right') && onAddClick ? 36 : undefined,
                    }}
                    role="button"
                    tabIndex={-1}
                  >
                    <DIcon dSize={18}>
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
              <div className={getClassName(`${dPrefix}tabs__button`, 'is-add')} role="button" tabIndex={-1} onClick={handleAddClick}>
                <DIcon dSize={18}>
                  <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                  <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                </DIcon>
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
            className={`${dPrefix}tabpanel`}
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
