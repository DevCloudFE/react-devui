import type { Updater } from '../../hooks/two-way-binding';
import type { DTriggerRenderProps } from '../_popup';
import type { DDropdownItemProps } from './DropdownItem';

import React, { useId, useCallback, useEffect, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useRefCallback, useTwoWayBinding, useAsync, useTranslation } from '../../hooks';
import { getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';

export interface DDropdownContextData {
  dropdownVisible: boolean;
  dropdownPopupTrigger: 'hover' | 'click';
  dropdownFocusId: [string, string] | null;
  onItemClick: (id: string) => void;
  onFocus: (dId: string, id: string) => void;
  onBlur: () => void;
}
export const DDropdownContext = React.createContext<DDropdownContextData | null>(null);

export interface DDropdownProps extends React.HTMLAttributes<HTMLElement> {
  dTriggerNode: React.ReactNode;
  dVisible?: [boolean, Updater<boolean>?];
  dPlacement?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right';
  dTrigger?: 'hover' | 'click';
  dSubTrigger?: 'hover' | 'click';
  dDestroy?: boolean;
  dArrow?: boolean;
  dCloseOnItemClick?: boolean;
  dPopupClassName?: string;
  onVisibleChange?: (visible: boolean) => void;
  onItemClick?: (id: string) => void;
}

export function DDropdown(props: DDropdownProps) {
  const {
    dTriggerNode,
    dVisible,
    dPlacement = 'bottom-right',
    dTrigger = 'hover',
    dSubTrigger = 'hover',
    dDestroy = false,
    dArrow = false,
    dCloseOnItemClick = true,
    dPopupClassName,
    onVisibleChange,
    onItemClick,
    id,
    className,
    children,
    ...restProps
  } = useComponentConfig(DDropdown.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const [t] = useTranslation('Common');

  const asyncCapture = useAsync();

  const [focusId, setFocusId] = useImmer<DDropdownContextData['dropdownFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const [visible, changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}dropdown-${uniqueId}`;

  const customTransition = useCallback(
    (popupEl, targetEl) => {
      const { top, left, transformOrigin, arrowPosition } = getVerticalSideStyle(popupEl, targetEl, dPlacement, 8);

      return {
        top,
        left,
        stateList: {
          'enter-from': { transform: 'scaleY(0.7)', opacity: '0' },
          'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
          'leave-active': { transition: 'transform 116ms ease-in, opacity 116ms ease-in', transformOrigin },
          'leave-to': { transform: 'scaleY(0.7)', opacity: '0' },
        },
        arrowPosition,
      };
    },
    [dPlacement]
  );

  useEffect(() => {
    let isFocus = false;
    if (focusId) {
      navEl?.childNodes.forEach((child) => {
        if (focusId[1] === (child as HTMLElement)?.id) {
          isFocus = true;
        }
      });
    }
    setActiveDescendant(isFocus ? focusId?.[1] : undefined);
  }, [focusId, navEl?.childNodes, setActiveDescendant]);

  const contextValue = useMemo<DDropdownContextData>(
    () => ({
      dropdownVisible: visible,
      dropdownPopupTrigger: dSubTrigger,
      dropdownFocusId: focusId,
      onItemClick: (id) => {
        onItemClick?.(id);

        // The `DPopup` will emit `onVisibleChange` callback when click popup.
        // So use `setTimeout` make sure change visible.
        if (dCloseOnItemClick) {
          asyncCapture.setTimeout(() => {
            changeVisible(false);
          }, 20);
        }
      },
      onFocus: (dId, id) => {
        setFocusId([dId, id]);
      },
      onBlur: () => {
        setFocusId(null);
      },
    }),
    [asyncCapture, changeVisible, dCloseOnItemClick, dSubTrigger, focusId, onItemClick, setFocusId, visible]
  );

  const childs = useMemo(() => {
    return React.Children.map(children as Array<React.ReactElement<DDropdownItemProps>>, (child, index) => {
      let tabIndex = child.props.tabIndex;
      if (index === 0) {
        tabIndex = 0;
      }

      return React.cloneElement(child, {
        ...child.props,
        tabIndex,
      });
    });
  }, [children]);

  const renderTrigger = useCallback(
    ({ onMouseEnter, onMouseLeave, onFocus, onBlur, onClick, ...renderProps }: DTriggerRenderProps) => {
      if (dTriggerNode) {
        const triggerNode = React.Children.only(dTriggerNode) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
        const props: DTriggerRenderProps = renderProps;
        if (onMouseEnter) {
          props.onMouseEnter = (e) => {
            triggerNode.props.onMouseEnter?.(e);
            onMouseEnter?.(e);
          };
          props.onMouseLeave = (e) => {
            triggerNode.props.onMouseLeave?.(e);
            onMouseLeave?.(e);
          };
        }
        if (onFocus) {
          props.onFocus = (e) => {
            triggerNode.props.onFocus?.(e);
            onFocus?.(e);
          };
          props.onBlur = (e) => {
            triggerNode.props.onBlur?.(e);
            onBlur?.(e);
          };
        }
        if (onClick) {
          props.onClick = (e) => {
            triggerNode.props.onClick?.(e);
            onClick?.(e);
          };
        }

        return React.cloneElement(triggerNode, {
          ...triggerNode.props,
          ...props,
          role: 'button',
          'aria-haspopup': 'menu',
          'aria-expanded': visible ? true : undefined,
          'aria-controls': _id,
        });
      }

      return null;
    },
    [_id, dTriggerNode, visible]
  );

  return (
    <DDropdownContext.Provider value={contextValue}>
      <DPopup
        className={getClassName(dPopupClassName, `${dPrefix}dropdown-popup`)}
        dVisible={visible}
        dTrigger={dTrigger}
        dPopupContent={
          <nav
            {...restProps}
            ref={navRef}
            className={getClassName(className, `${dPrefix}dropdown`)}
            tabIndex={-1}
            role="menubar"
            aria-orientation="vertical"
            aria-activedescendant={activedescendant}
          >
            {React.Children.count(childs) === 0 ? <span className={`${dPrefix}dropdown__empty`}>{t('No Data')}</span> : childs}
          </nav>
        }
        dCustomPopup={customTransition}
        dTriggerRender={renderTrigger}
        dDestroy={dDestroy}
        dArrow={dArrow}
        onVisibleChange={changeVisible}
      ></DPopup>
    </DDropdownContext.Provider>
  );
}
