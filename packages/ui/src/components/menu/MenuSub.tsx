import type { DMenuItemProps } from './MenuItem';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomRef, useCustomContext, useImmer } from '../../hooks';
import { getClassName, getFixedSideStyle, toId } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';
import { DIcon } from '../icon';
import { DMenuContext } from './Menu';

export interface DMenuSubContextData {
  dActive?: string;
  onPopupTrigger: (id: string, visible: boolean) => void;
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
  const {
    menuMode,
    menuExpandTrigger,
    menuActiveId,
    menuExpandIds,
    menuFocusId,
    menuCurrentData,
    onExpandChange,
    onFocus: _onFocus,
    onBlur: _onBlur,
  } = useCustomContext(DMenuContext);
  const { onPopupTrigger } = useCustomContext(DMenuSubContext);
  //#endregion

  //#region Ref
  const [menuCollapseEl, menuCollapseRef] = useCustomRef<HTMLUListElement>();
  const [menuPopupEl, menuPopupRef] = useCustomRef<HTMLUListElement>();
  const [liEl, liRef] = useCustomRef<HTMLLIElement>();
  //#endregion

  const [menuWidth, setMenuWidth] = useImmer<number | undefined>(undefined);
  const [childrenPopup, setChildrenPopup] = useImmer(new Map<string, boolean>());
  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);

  const expand = menuExpandIds?.has(dId) ?? false;
  const popupMode = menuMode !== 'vertical';
  const popupVisible = useMemo(() => {
    let visible = false;
    for (const childVisible of childrenPopup.values()) {
      if (childVisible) {
        visible = true;
        break;
      }
    }
    return visible;
  }, [childrenPopup]);
  const inNav = menuCurrentData?.navIds.has(dId) ?? false;
  const horizontal = menuMode === 'horizontal' && inNav;
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
    if (horizontal && popupVisible) {
      return 180;
    }
    if (menuMode === 'vertical' && expand) {
      return 180;
    }
    if (popupMode && !horizontal) {
      return -90;
    }
    return undefined;
  }, [expand, horizontal, menuMode, popupMode, popupVisible]);

  const customTransition = useCallback(
    (popupEl, targetEl) => {
      const { top, left, transformOrigin } = getFixedSideStyle(
        popupEl,
        targetEl,
        horizontal ? 'bottom' : 'right',
        horizontal ? 12 : inNav ? 10 : 18
      );
      setMenuWidth(targetEl.getBoundingClientRect().width - 32);
      return {
        top,
        left: horizontal ? left + 16 : left,
        stateList: {
          'enter-from': { transform: horizontal ? 'scaleY(0.7)' : 'scale(0)', opacity: '0' },
          'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
          'leave-to': {
            transform: horizontal ? 'scaleY(0.7)' : 'scale(0)',
            opacity: '0',
            transition: 'transform 116ms ease-in, opacity 116ms ease-in',
            transformOrigin,
          },
        },
      };
    },
    [horizontal, inNav, setMenuWidth]
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

  const handlePopupTrigger = useCallback(
    (visible) => {
      setChildrenPopup((draft) => {
        draft.set(dId, visible);
      });
      onPopupTrigger?.(dId, visible);
    },
    [setChildrenPopup, onPopupTrigger, dId]
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
  }, [menuCollapseEl, menuFocusId, popupMode, menuPopupEl, setActiveDescendant]);

  useEffect(() => {
    if (!popupMode) {
      setChildrenPopup((draft) => {
        draft.clear();
      });
    }
  }, [popupMode, setChildrenPopup]);
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

  const triggerNode = <div style={{ position: 'absolute', zIndex: -1, top: 0, right: 0, bottom: 0, left: 0 }}></div>;

  const menuNode = (ref: (instance: HTMLUListElement | null) => void) => (
    <ul
      ref={ref}
      className={`${dPrefix}menu-list`}
      style={{
        width: horizontal ? menuWidth : undefined,
        minWidth: horizontal ? undefined : 160,
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
      onPopupTrigger: (id, visible) => {
        setChildrenPopup((draft) => {
          draft.set(id, visible);
        });
        onPopupTrigger?.(id, visible);
      },
    }),
    [onPopupTrigger, setChildrenPopup]
  );

  return (
    <DMenuSubContext.Provider value={contextValue}>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-sub`, {
          'is-active': isActive,
          'is-expand': popupMode ? popupVisible : expand,
          'is-horizontal': horizontal,
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
        {triggerNode}
      </li>
      {popupMode ? (
        <DPopup
          className={`${dPrefix}menu-sub__popup`}
          dVisible={popupVisible}
          dPopupContent={menuNode(menuPopupRef)}
          dTrigger={menuExpandTrigger}
          dArrow={false}
          dCustomPopup={customTransition}
          dTriggerNode={liEl}
          onTrigger={handlePopupTrigger}
        />
      ) : (
        <DTrigger dTrigger={menuExpandTrigger} dTriggerNode={liEl} onTrigger={handleExpandTrigger} />
      )}
      <DCollapseTransition
        dEl={menuCollapseEl}
        dVisible={popupMode ? false : expand}
        dDirection="height"
        dDuring={200}
        dDestroy={popupMode}
      >
        {menuNode(menuCollapseRef)}
      </DCollapseTransition>
    </DMenuSubContext.Provider>
  );
}
