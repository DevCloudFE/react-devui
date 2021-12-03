import type { DMenuItemProps } from './MenuItem';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useImmer, useRefCallback } from '../../hooks';
import { getClassName, getHorizontalSideStyle, getVerticalSideStyle, toId } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';
import { DIcon } from '../icon';
import { DMenuContext } from './Menu';

export interface DMenuSubContextData {
  onPopupTrigger: (visible: boolean) => void;
}
export const DMenuSubContext = React.createContext<DMenuSubContextData | null>(null);

export interface DMenuSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
  __level?: number;
}

export function DMenuSub(props: DMenuSubProps) {
  const {
    dId,
    dIcon,
    dTitle,
    dDisabled = false,
    __level = 0,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig('menu-sub', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [
    {
      menuMode,
      menuExpandTrigger,
      menuActiveId,
      menuExpandIds,
      menuFocusId,
      menuCurrentData,
      onExpandChange,
      onFocus: _onFocus,
      onBlur: _onBlur,
    },
  ] = useCustomContext(DMenuContext);
  const [{ onPopupTrigger }] = useCustomContext(DMenuSubContext);

  //#endregion

  //#region Ref
  const [menuCollapseEl, menuCollapseRef] = useRefCallback<HTMLUListElement>();
  const [menuPopupEl, menuPopupRef] = useRefCallback<HTMLUListElement>();
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const [menuWidth, setMenuWidth] = useImmer<number | undefined>(undefined);
  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);

  const expand = menuExpandIds?.has(dId) ?? false;
  const popupMode = menuMode !== 'vertical';
  const [currentPopupVisible, setCurrentPopupVisible] = useImmer(false);
  const [childrenPopupVisiable, setChildrenPopupVisiable] = useImmer(false);
  const popupVisible = currentPopupVisible || childrenPopupVisiable;
  const inNav = menuCurrentData?.navIds.has(dId) ?? false;
  const inHorizontalNav = menuMode === 'horizontal' && inNav;
  const _id = id ?? `${dPrefix}menu-sub-${toId(dId)}`;
  const isActive = useMemo(() => {
    if (popupMode ? !popupVisible : !expand) {
      const ids: string[] = [];
      const getAllIds = (id: string) => {
        ids.push(id);
        const childIds = menuCurrentData?.ids.get(id);
        if (childIds) {
          for (const childId of childIds.values()) {
            getAllIds(childId);
          }
        }
      };
      getAllIds(dId);
      return menuActiveId ? ids.includes(menuActiveId) : false;
    }
    return false;
  }, [dId, expand, menuActiveId, menuCurrentData?.ids, popupMode, popupVisible]);
  const iconRotate = useMemo(() => {
    if (inHorizontalNav && popupVisible) {
      return 180;
    }
    if (menuMode === 'vertical' && expand) {
      return 180;
    }
    if (popupMode && !inHorizontalNav) {
      return -90;
    }
    return undefined;
  }, [expand, inHorizontalNav, menuMode, popupMode, popupVisible]);

  const customTransition = useCallback(
    (popupEl, targetEl) => {
      const { top, left, transformOrigin } = inHorizontalNav
        ? getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 12)
        : getHorizontalSideStyle(popupEl, targetEl, 'right', inNav ? 10 : 14);
      if (inHorizontalNav) {
        setMenuWidth(targetEl.getBoundingClientRect().width - 32);
      }
      return {
        top,
        left: inHorizontalNav ? left + 16 : left,
        stateList: {
          'enter-from': { transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)', opacity: '0' },
          'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
          'leave-active': { transition: 'transform 116ms ease-in, opacity 116ms ease-in', transformOrigin },
          'leave-to': { transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)', opacity: '0' },
        },
      };
    },
    [inHorizontalNav, inNav, setMenuWidth]
  );

  const handleExpandTrigger = useCallback(
    (val) => {
      if (menuExpandTrigger === 'click') {
        onExpandChange?.(dId, !expand);
      } else if (val) {
        onExpandChange?.(dId, true);
      }
    },
    [dId, expand, menuExpandTrigger, onExpandChange]
  );

  const handlePopupVisibleChange = useCallback(
    (visible) => {
      setCurrentPopupVisible(visible);
    },
    [setCurrentPopupVisible]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);

      !dDisabled && _onFocus?.(dId, _id);
    },
    [_id, _onFocus, dDisabled, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      _onBlur?.();
    },
    [_onBlur, onBlur]
  );

  //#region DidUpdate
  useEffect(() => {
    let isFocus = false;
    if (menuFocusId) {
      (popupMode ? menuPopupEl : menuCollapseEl)?.childNodes.forEach((child) => {
        if (menuFocusId[1] === (child as HTMLElement)?.id) {
          isFocus = true;
        }
      });
    }
    setActiveDescendant(isFocus ? menuFocusId?.[1] : undefined);
  }, [menuCollapseEl, menuFocusId, menuPopupEl, popupMode, setActiveDescendant]);

  useEffect(() => {
    if (!popupMode) {
      setCurrentPopupVisible(false);
    }
  }, [popupMode, setCurrentPopupVisible]);

  useEffect(() => {
    onPopupTrigger?.(popupVisible);
  }, [onPopupTrigger, popupVisible]);
  //#endregion

  const childs = useMemo(() => {
    const length = React.Children.count(children);

    return React.Children.map(children as Array<React.ReactElement<DMenuItemProps>>, (child, index) =>
      React.cloneElement(child, {
        ...child.props,
        className: getClassName(child.props.className, {
          'is-first': length > 1 && index === 0,
          'is-last': length > 1 && index === length - 1,
        }),
        __level: popupMode ? 0 : __level + 1,
      })
    );
  }, [children, popupMode, __level]);

  const menuNode = (_props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
    <ul
      {..._props}
      className={getClassName(_props.className, `${dPrefix}menu-list`)}
      style={{
        ..._props.style,
        width: inHorizontalNav ? menuWidth : undefined,
        minWidth: inHorizontalNav ? undefined : 160,
      }}
      role="menu"
      tabIndex={-1}
      aria-labelledby={_id}
      aria-orientation="vertical"
      aria-activedescendant={activedescendant}
    >
      {childs}
    </ul>
  );

  const contextValue = useMemo<DMenuSubContextData>(
    () => ({
      onPopupTrigger: (visible) => {
        setChildrenPopupVisiable(visible);
      },
    }),
    [setChildrenPopupVisiable]
  );

  return (
    <DMenuSubContext.Provider value={contextValue}>
      <DCollapseTransition
        dEl={menuCollapseEl}
        dVisible={popupMode ? false : expand}
        dDuring={200}
        dRender={(hidden) => (
          <>
            <li
              {...restProps}
              ref={liRef}
              id={_id}
              className={getClassName(className, `${dPrefix}menu-sub`, {
                'is-active': isActive,
                'is-expand': popupMode ? popupVisible : expand,
                'is-horizontal': inHorizontalNav,
                'is-icon': menuMode === 'icon' && inNav,
                'is-disabled': dDisabled,
              })}
              style={{
                ...style,
                paddingLeft: 16 + __level * 20,
              }}
              role="menuitem"
              tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
              aria-haspopup={true}
              aria-expanded={popupMode ? popupVisible : expand}
              aria-disabled={dDisabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <div className={`${dPrefix}menu-sub__indicator`}>
                <div style={{ backgroundColor: __level === 0 ? 'transparent' : undefined }}></div>
              </div>
              {dIcon && <div className={`${dPrefix}menu-sub__icon`}>{dIcon}</div>}
              <div className={`${dPrefix}menu-sub__title`}>{dTitle}</div>
              <DIcon className={`${dPrefix}menu-sub__arrow`} dSize={14} dRotate={iconRotate}>
                <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
              </DIcon>
            </li>
            {!dDisabled && (
              <>
                {popupMode ? (
                  <DPopup
                    className={`${dPrefix}menu-sub__popup`}
                    dVisible={[popupVisible]}
                    dPopupContent={menuNode({ ref: menuPopupRef })}
                    dTrigger={menuExpandTrigger}
                    dArrow={false}
                    dCustomPopup={customTransition}
                    dTriggerEl={liEl}
                    onVisibleChange={handlePopupVisibleChange}
                  />
                ) : (
                  <DTrigger dTrigger={menuExpandTrigger} dTriggerEl={liEl} onTrigger={handleExpandTrigger} />
                )}
                {popupMode && hidden
                  ? null
                  : menuNode({
                      ref: menuCollapseRef,
                      style: { display: hidden ? 'none' : undefined },
                    })}
              </>
            )}
          </>
        )}
      />
    </DMenuSubContext.Provider>
  );
}
