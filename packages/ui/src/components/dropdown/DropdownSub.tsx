import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';

import { useDPrefixConfig, useDComponentConfig, useCustomContext, useImmer, useRefCallback, useTranslation } from '../../hooks';
import { getClassName, getHorizontalSideStyle, toId } from '../../utils';
import { DPopup } from '../_popup';
import { DIcon } from '../icon';
import { DDropdownContext } from './Dropdown';

export interface DDropdownSubContextData {
  onPopupTrigger: (visible: boolean) => void;
}
export const DDropdownSubContext = React.createContext<DDropdownSubContextData | null>(null);

export interface DDropdownSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDisabled?: boolean;
}

export function DDropdownSub(props: DDropdownSubProps) {
  const {
    dId,
    dIcon,
    dTitle,
    dDisabled = false,
    id,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig(DDropdownSub.name, props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  const [{ dropdownVisible, dropdownFocusId, dropdownPopupTrigger, onFocus: _onFocus, onBlur: _onBlur }] =
    useCustomContext(DDropdownContext);
  const [{ onPopupTrigger }] = useCustomContext(DDropdownSubContext);
  //#endregion

  //#region Ref
  const [ulEl, ulRef] = useRefCallback<HTMLUListElement>();
  const [liEl, liRef] = useRefCallback<HTMLLIElement>();
  //#endregion

  const [t] = useTranslation('Common');

  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);

  const [currentPopupVisible, setCurrentPopupVisible] = useImmer(false);
  const [childrenPopupVisiable, setChildrenPopupVisiable] = useImmer(false);
  const popupVisible = currentPopupVisible || childrenPopupVisiable;

  const _id = id ?? `${dPrefix}dropdown-sub-${toId(dId)}`;

  const customTransition = useCallback((popupEl, targetEl) => {
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
  }, []);

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
    if (dropdownFocusId) {
      ulEl?.childNodes.forEach((child) => {
        if (dropdownFocusId[1] === (child as HTMLElement)?.id) {
          isFocus = true;
        }
      });
    }
    setActiveDescendant(isFocus ? dropdownFocusId?.[1] : undefined);
  }, [dropdownFocusId, ulEl, setActiveDescendant]);

  useEffect(() => {
    if (!dropdownVisible) {
      setCurrentPopupVisible(false);
    }
  }, [dropdownVisible, setCurrentPopupVisible]);

  useEffect(() => {
    onPopupTrigger?.(popupVisible);
  }, [onPopupTrigger, popupVisible]);
  //#endregion

  const contextValue = useMemo<DDropdownSubContextData>(
    () => ({
      onPopupTrigger: (visible) => {
        setChildrenPopupVisiable(visible);
      },
    }),
    [setChildrenPopupVisiable]
  );

  return (
    <DDropdownSubContext.Provider value={contextValue}>
      <li
        {...restProps}
        ref={liRef}
        id={_id}
        className={getClassName(className, `${dPrefix}dropdown-sub`, {
          'is-disabled': dDisabled,
        })}
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
        <DIcon className={`${dPrefix}dropdown-sub__arrow`} dSize={14}>
          <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>{' '}
        </DIcon>
      </li>
      {!dDisabled && (
        <DPopup
          className={`${dPrefix}dropdown-sub__popup`}
          dVisible={[popupVisible]}
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
              {React.Children.count(children) === 0 ? <span className={`${dPrefix}dropdown-sub__empty`}>{t('No Data')}</span> : children}
            </ul>
          }
          dTrigger={dropdownPopupTrigger}
          dArrow={false}
          dCustomPopup={customTransition}
          dTriggerEl={liEl}
          dMouseLeaveDelay={150 + 116 + 50}
          onVisibleChange={handlePopupVisibleChange}
        />
      )}
    </DDropdownSubContext.Provider>
  );
}
