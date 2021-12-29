import type { DMenuItemProps } from './MenuItem';

import { isString, isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useCustomContext,
  useRefCallback,
  useTranslation,
  useDCollapseTransition,
  useImmer,
  useStateBackflow,
} from '../../hooks';
import { getClassName, getHorizontalSideStyle, getVerticalSideStyle, toId, mergeStyle } from '../../utils';
import { DPopup } from '../_popup';
import { DTrigger } from '../_trigger';
import { DIcon } from '../icon';
import { DMenuContext } from './Menu';

type DIds = Map<string, string | DIds>;

export interface DMenuSubContextData {
  updateChildren: (identity: string, ids: DIds | string, visible: boolean) => void;
  removeChildren: (identity: string) => void;
}
export const DMenuSubContext = React.createContext<DMenuSubContextData | null>(null);

export interface DMenuSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
  dPopupClassName?: string;
  __level?: number;
  __inNav?: boolean;
}

export function DMenuSub(props: DMenuSubProps) {
  const {
    dId,
    dIcon,
    dTitle,
    dDisabled = false,
    dPopupClassName,
    __level = 0,
    __inNav = false,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useComponentConfig(DMenuSub.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ menuMode, menuExpandTrigger, menuActiveId, menuExpandIds, menuFocusId, onExpandChange, onFocus: _onFocus, onBlur: _onBlur }] =
    useCustomContext(DMenuContext);
  const [{ updateChildren, removeChildren }] = useCustomContext(DMenuSubContext);
  //#endregion

  //#region Ref
  const [menuCollapseEl, menuCollapseRef] = useRefCallback<HTMLUListElement>();
  const [menuPopupEl, menuPopupRef] = useRefCallback<HTMLUListElement>();
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const [t] = useTranslation('Common');

  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const expand = menuExpandIds?.has(dId) ?? false;
  const popupMode = menuMode !== 'vertical';

  const [childrenIds, setChildrenIds] = useImmer<DIds>(new Map());

  const [currentPopupVisible, setCurrentPopupVisible] = useState(false);
  const [childrenPopupVisiable, setChildrenPopupVisiable] = useImmer(new Map<string, boolean>());
  const popupVisible = useMemo(() => {
    let visible = currentPopupVisible;
    for (const childrenVisiable of childrenPopupVisiable.values()) {
      if (childrenVisiable) {
        visible = childrenVisiable;
        break;
      }
    }
    return visible;
  }, [childrenPopupVisiable, currentPopupVisible]);

  useStateBackflow(updateChildren, removeChildren, childrenIds, popupVisible);

  const inHorizontalNav = menuMode === 'horizontal' && __inNav;
  const _id = id ?? `${dPrefix}menu-sub-${toId(dId)}`;
  const isActive = useMemo(() => {
    if (isString(menuActiveId)) {
      if (popupMode ? !popupVisible : !expand) {
        const checkActive = (idMap: DIds): boolean | undefined => {
          for (const id of idMap.values()) {
            if (isString(id)) {
              if (id === menuActiveId) {
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
  }, [childrenIds, expand, menuActiveId, popupMode, popupVisible]);

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
    (popupEl: HTMLElement, targetEl: HTMLElement) => {
      const { top, left, transformOrigin } = inHorizontalNav
        ? getVerticalSideStyle(popupEl, targetEl, 'bottom-left', 12)
        : getHorizontalSideStyle(popupEl, targetEl, 'right', __inNav ? 10 : 14);
      if (inHorizontalNav) {
        popupEl.style.width = targetEl.getBoundingClientRect().width - 32 + 'px';
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
    [inHorizontalNav, __inNav]
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
  //#endregion

  const childs = useMemo(() => {
    const length = React.Children.count(children);

    return React.Children.map(children as Array<React.ReactElement<DMenuItemProps>>, (child, index) =>
      React.cloneElement(child, {
        ...child.props,
        className: getClassName(child.props.className, {
          'js-first': length > 1 && index === 0,
          'js-last': length > 1 && index === length - 1,
        }),
        __level: popupMode ? 0 : __level + 1,
      })
    );
  }, [children, popupMode, __level]);

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
        <span className={`${dPrefix}menu-sub__empty`} style={{ paddingLeft: 16 + (__level + 1) * 20 }}>
          {t('No Data')}
        </span>
      ) : (
        childs
      )}
    </ul>
  );

  const stateBackflow = useMemo<Pick<DMenuSubContextData, 'updateChildren' | 'removeChildren'>>(
    () => ({
      updateChildren: (identity, ids, visible) => {
        setChildrenIds((draft) => {
          draft.set(identity, ids);
        });
        setChildrenPopupVisiable((draft) => {
          draft.set(identity, visible);
        });
      },
      removeChildren: (identity) => {
        setChildrenIds((draft) => {
          draft.delete(identity);
        });
        setChildrenPopupVisiable((draft) => {
          draft.delete(identity);
        });
      },
    }),
    [setChildrenIds, setChildrenPopupVisiable]
  );
  const contextValue = useMemo<DMenuSubContextData>(
    () => ({
      ...stateBackflow,
    }),
    [stateBackflow]
  );

  const hidden = useDCollapseTransition({
    dEl: menuCollapseEl,
    dVisible: popupMode ? false : expand,
    dDuring: 200,
  });

  return (
    <DMenuSubContext.Provider value={contextValue}>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}menu-sub`, {
          [`${dPrefix}menu-sub--horizontal`]: inHorizontalNav,
          [`${dPrefix}menu-sub--icon`]: menuMode === 'icon' && __inNav,
          'is-active': isActive,
          'is-expand': popupMode ? popupVisible : expand,
          'is-disabled': dDisabled,
        })}
        style={mergeStyle(style, {
          paddingLeft: 16 + __level * 20,
        })}
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
    </DMenuSubContext.Provider>
  );
}
