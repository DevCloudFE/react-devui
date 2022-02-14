import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useCustomContext,
  useRefCallback,
  useTranslation,
  useImmer,
  useIsomorphicLayoutEffect,
} from '../../hooks';
import { generateComponentMate, getClassName, getHorizontalSideStyle, mergeStyle, toId } from '../../utils';
import { DPopup } from '../_popup';
import { DIcon } from '../icon';
import { DDropdownContext } from './Dropdown';

export interface DDropdownSubContextData {
  gUpdateChildren: (id: string, visible: boolean) => void;
  gRemoveChildren: (id: string) => void;
}
export const DDropdownSubContext = React.createContext<DDropdownSubContextData | null>(null);

export interface DDropdownSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
  dPopupClassName?: string;
  __level?: number;
}

const { COMPONENT_NAME } = generateComponentMate('DDropdownSub');
export function DDropdownSub(props: DDropdownSubProps): JSX.Element | null {
  const {
    dId,
    dIcon,
    dTitle,
    dDisabled = false,
    dPopupClassName,
    __level = 0,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const [{ gVisible, gPopupTrigger, gFocusId, gOnFocus, gOnBlur }] = useCustomContext(DDropdownContext);
  //#endregion

  //#region Ref
  const [ulEl, ulRef] = useRefCallback<HTMLUListElement>();
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  const [{ gUpdateChildren, gRemoveChildren }] = useCustomContext(DDropdownSubContext);
  //#endregion

  const [t] = useTranslation('Common');

  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

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
    gUpdateChildren?.(dId, popupVisible);
    return () => {
      gRemoveChildren?.(dId);
    };
  }, [dId, gRemoveChildren, gUpdateChildren, popupVisible]);

  const _id = id ?? `${dPrefix}dropdown-sub-${toId(dId)}`;

  useEffect(() => {
    let isFocus = false;
    if (gFocusId) {
      ulEl?.childNodes.forEach((child) => {
        if (gFocusId[1] === (child as HTMLElement)?.id) {
          isFocus = true;
        }
      });
    }
    setActiveDescendant(isFocus ? gFocusId?.[1] : undefined);
  }, [gFocusId, ulEl, setActiveDescendant]);

  useEffect(() => {
    if (!gVisible) {
      setCurrentPopupVisible(false);
    }
  }, [gVisible, setCurrentPopupVisible]);

  const _gUpdateChildren = useCallback(
    (id, visible) => {
      setChildrenPopupVisiable((draft) => {
        draft.set(id, visible);
      });
    },
    [setChildrenPopupVisiable]
  );
  const _gRemoveChildren = useCallback(
    (id) => {
      setChildrenPopupVisiable((draft) => {
        draft.delete(id);
      });
    },
    [setChildrenPopupVisiable]
  );
  const contextValue = useMemo<DDropdownSubContextData>(
    () => ({
      gUpdateChildren: _gUpdateChildren,
      gRemoveChildren: _gRemoveChildren,
    }),
    [_gRemoveChildren, _gUpdateChildren]
  );

  const handleFocus: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onFocus?.(e);

    !dDisabled && gOnFocus?.(dId, _id);
  };

  const handleBlur: React.FocusEventHandler<HTMLLIElement> = (e) => {
    onBlur?.(e);

    gOnBlur?.();
  };

  const handlePopupVisibleChange = (visible: boolean) => {
    setCurrentPopupVisible(visible);
  };

  return (
    <DDropdownSubContext.Provider value={contextValue}>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}dropdown-sub`, {
          'is-disabled': dDisabled,
        })}
        style={mergeStyle(
          {
            paddingLeft: 12 + __level * 16,
          },
          style
        )}
        role="menuitem"
        tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
        aria-haspopup={true}
        aria-expanded={popupVisible}
        aria-disabled={dDisabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {dIcon && <div className={`${dPrefix}dropdown-sub__icon`}>{dIcon}</div>}
        <div className={`${dPrefix}dropdown-sub__title`}>{dTitle}</div>
        <DIcon className={`${dPrefix}dropdown-sub__arrow`} viewBox="64 64 896 896" dSize={14}>
          <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
        </DIcon>
      </li>
      {!dDisabled && (
        <DPopup
          className={getClassName(dPopupClassName, `${dPrefix}dropdown-sub-popup`)}
          dVisible={popupVisible}
          dPopupContent={
            <ul
              ref={ulRef}
              className={`${dPrefix}dropdown-sub__list`}
              role="menu"
              tabIndex={-1}
              aria-labelledby={_id}
              aria-orientation="vertical"
              aria-activedescendant={activedescendant}
            >
              {React.Children.count(children) === 0 ? (
                <span
                  className={`${dPrefix}dropdown-sub__empty`}
                  style={{
                    paddingLeft: 12 + __level * 16,
                  }}
                >
                  {t('No Data')}
                </span>
              ) : (
                children
              )}
            </ul>
          }
          dTrigger={gPopupTrigger}
          dArrow={false}
          dCustomPopup={(popupEl, targetEl) => {
            const { top, left, transformOrigin } = getHorizontalSideStyle(popupEl, targetEl, 'right', 10);
            return {
              top,
              left,
              stateList: {
                'enter-from': { transform: 'scale(0)', opacity: '0' },
                'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
                'leave-active': { transition: 'transform 116ms ease-in, opacity 116ms ease-in', transformOrigin },
                'leave-to': { transform: 'scale(0)', opacity: '0' },
              },
            };
          }}
          dTriggerEl={liEl}
          onVisibleChange={handlePopupVisibleChange}
        />
      )}
    </DDropdownSubContext.Provider>
  );
}
