import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useRefCallback,
  useTranslation,
  useDCollapseTransition,
  useImmer,
  useIsomorphicLayoutEffect,
  useContextOptional,
  useContextRequired,
} from '../../hooks';
import { getClassName, getHorizontalSideStyle, getVerticalSideStyle, toId, mergeStyle, generateComponentMate } from '../../utils';
import { DPopup } from '../_popup';
import { DTrigger } from '../_trigger';
import { DIcon } from '../icon';
import { DMenuContext } from './Menu';

type DIds = Map<string, string | DIds>;

export interface DMenuSubContextData {
  gUpdateChildren: (id: string, ids: DIds | string, visible: boolean) => void;
  gRemoveChildren: (id: string) => void;
}
export const DMenuSubContext = React.createContext<DMenuSubContextData | null>(null);

export interface DMenuSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
  dPopupClassName?: string;
}

export interface DMenuSubPropsWithPrivate extends DMenuSubProps {
  __level?: number;
  __inNav?: boolean;
}

const { COMPONENT_NAME } = generateComponentMate('DMenuSub');
export function DMenuSub(props: DMenuSubProps): JSX.Element | null {
  const {
    dId,
    dIcon,
    dTitle,
    dDisabled = false,
    dPopupClassName,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    __level = 0,
    __inNav = false,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props as DMenuSubPropsWithPrivate);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { gMode, gExpandTrigger, gActiveId, gExpandIds, gFocusId, gOnExpandChange, gOnFocus, gOnBlur } = useContextRequired(DMenuContext);
  const { gUpdateChildren, gRemoveChildren } = useContextOptional(DMenuSubContext);
  //#endregion

  //#region Ref
  const [menuCollapseEl, menuCollapseRef] = useRefCallback<HTMLUListElement>();
  const [menuPopupEl, menuPopupRef] = useRefCallback<HTMLUListElement>();
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const [t] = useTranslation('Common');

  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const expand = gExpandIds.has(dId) ?? false;
  const popupMode = gMode !== 'vertical';

  const [childrenIds, setChildrenIds] = useImmer<DIds>(new Map());

  const [currentPopupVisible, setCurrentPopupVisible] = useState(false);
  const [childrenPopupVisiable, setChildrenPopupVisiable] = useImmer(new Map<string, boolean>());
  const popupVisible = (() => {
    let visible = currentPopupVisible;
    for (const childrenVisiable of childrenPopupVisiable.values()) {
      if (childrenVisiable) {
        visible = childrenVisiable;
        break;
      }
    }
    return visible;
  })();

  useIsomorphicLayoutEffect(() => {
    gUpdateChildren?.(dId, childrenIds, popupVisible);
    return () => {
      gRemoveChildren?.(dId);
    };
  }, [childrenIds, dId, gRemoveChildren, gUpdateChildren, popupVisible]);

  const inHorizontalNav = gMode === 'horizontal' && __inNav;
  const _id = id ?? `${dPrefix}menu-sub-${toId(dId)}`;
  const isActive = (() => {
    if (isString(gActiveId)) {
      if (popupMode ? !popupVisible : !expand) {
        const checkActive = (idMap: DIds): boolean | undefined => {
          for (const id of idMap.values()) {
            if (isString(id)) {
              if (id === gActiveId) {
                return true;
              }
            } else {
              const res = checkActive(id);
              if (res) {
                return res;
              }
            }
          }
        };
        return checkActive(childrenIds) ?? false;
      }
    }

    return false;
  })();

  const iconRotate = (() => {
    if (inHorizontalNav && popupVisible) {
      return 180;
    }
    if (gMode === 'vertical' && expand) {
      return 180;
    }
    if (popupMode && !inHorizontalNav) {
      return -90;
    }
    return undefined;
  })();

  useEffect(() => {
    let isFocus = false;
    if (gFocusId) {
      (popupMode ? menuPopupEl : menuCollapseEl)?.childNodes.forEach((child) => {
        if (gFocusId[1] === (child as HTMLElement)?.id) {
          isFocus = true;
        }
      });
    }
    setActiveDescendant(isFocus ? gFocusId?.[1] : undefined);
  }, [menuCollapseEl, gFocusId, menuPopupEl, popupMode, setActiveDescendant]);

  useEffect(() => {
    if (!popupMode) {
      setCurrentPopupVisible(false);
    }
  }, [popupMode, setCurrentPopupVisible]);

  const childs = (() => {
    const length = React.Children.count(children);

    return React.Children.map(children as React.ReactElement[], (child, index) =>
      React.cloneElement(child, {
        ...child.props,
        className: getClassName(child.props.className, {
          'js-first': length > 1 && index === 0,
          'js-last': length > 1 && index === length - 1,
        }),
        __level: popupMode ? 0 : __level + 1,
      })
    );
  })();

  const menuNode = (_props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
    <ul
      {..._props}
      className={getClassName(_props.className, `${dPrefix}menu-sub__list`)}
      style={{
        ..._props.style,
        minWidth: inHorizontalNav ? undefined : 160,
      }}
      role="menu"
      tabIndex={-1}
      aria-labelledby={_id}
      aria-orientation="vertical"
      aria-activedescendant={activedescendant}
    >
      {React.Children.count(childs) === 0 ? (
        <span className={`${dPrefix}menu-sub__empty`} style={{ paddingLeft: 16 + (popupMode ? 0 : __level + 1) * 20 }}>
          {t('No Data')}
        </span>
      ) : (
        childs
      )}
    </ul>
  );

  const transitionState = {
    'enter-from': { height: '0' },
    'enter-to': { transition: 'height 0.2s linear' },
    'leave-to': { height: '0', transition: 'height 0.2s linear' },
  };
  const hidden = useDCollapseTransition({
    dEl: menuCollapseEl,
    dVisible: popupMode ? false : expand,
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
    dDuring: 200,
  });

  const _gUpdateChildren = useCallback(
    (id, ids, visible) => {
      setChildrenIds((draft) => {
        draft.set(id, ids);
      });
      setChildrenPopupVisiable((draft) => {
        draft.set(id, visible);
      });
    },
    [setChildrenIds, setChildrenPopupVisiable]
  );
  const _gRemoveChildren = useCallback(
    (id) => {
      setChildrenIds((draft) => {
        draft.delete(id);
      });
      setChildrenPopupVisiable((draft) => {
        draft.delete(id);
      });
    },
    [setChildrenIds, setChildrenPopupVisiable]
  );
  const contextValue = useMemo<DMenuSubContextData>(
    () => ({
      gUpdateChildren: _gUpdateChildren,
      gRemoveChildren: _gRemoveChildren,
    }),
    [_gRemoveChildren, _gUpdateChildren]
  );

  const handleFocus: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onFocus?.(e);

    !dDisabled && gOnFocus(dId, _id);
  };

  const handleBlur: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onBlur?.(e);

    gOnBlur();
  };

  const handlePopupVisibleChange = (visible: boolean) => {
    setCurrentPopupVisible(visible);
  };

  const handleTrigger = (state?: boolean) => {
    if (gExpandTrigger === 'click') {
      gOnExpandChange(dId, !expand);
    } else if (state) {
      gOnExpandChange(dId, true);
    }
  };

  return (
    <DMenuSubContext.Provider value={contextValue}>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-sub`, {
          [`${dPrefix}menu-sub--horizontal`]: inHorizontalNav,
          [`${dPrefix}menu-sub--icon`]: gMode === 'icon' && __inNav,
          'is-active': isActive,
          'is-expand': popupMode ? popupVisible : expand,
          'is-disabled': dDisabled,
        })}
        style={mergeStyle(
          {
            paddingLeft: 16 + __level * 20,
          },
          style
        )}
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
        <DIcon className={`${dPrefix}menu-sub__arrow`} viewBox="0 0 1024 1024" dSize={14} dRotate={iconRotate}>
          <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
        </DIcon>
      </li>
      {!dDisabled && (
        <>
          {popupMode ? (
            <DPopup
              className={getClassName(dPopupClassName, `${dPrefix}menu-sub-popup`)}
              dVisible={popupVisible}
              dPopupContent={menuNode({ ref: menuPopupRef })}
              dTrigger={gExpandTrigger}
              dArrow={false}
              dCustomPopup={(popupEl, targetEl) => {
                if (inHorizontalNav) {
                  popupEl.style.width = targetEl.getBoundingClientRect().width - 32 + 'px';
                }
                const { top, left, transformOrigin } = inHorizontalNav
                  ? getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 12)
                  : getHorizontalSideStyle(popupEl, targetEl, 'right', __inNav ? 10 : 14);
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
              }}
              dTriggerEl={liEl}
              onVisibleChange={handlePopupVisibleChange}
            />
          ) : (
            <DTrigger dTrigger={gExpandTrigger} dTriggerEl={liEl} onTrigger={handleTrigger} />
          )}
          {popupMode && hidden
            ? null
            : menuNode({
                ref: menuCollapseRef,
                style: { display: hidden ? 'none' : undefined },
              })}
        </>
      )}
    </DMenuSubContext.Provider>
  );
}
