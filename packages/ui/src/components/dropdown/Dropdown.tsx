import type { DUpdater } from '../../hooks/two-way-binding';
import type { DTriggerRenderProps } from '../_popup';

import React, { useId, useCallback, useEffect, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useRefCallback, useTwoWayBinding, useAsync, useTranslation } from '../../hooks';
import { generateComponentMate, getClassName, getVerticalSideStyle } from '../../utils';
import { DPopup } from '../_popup';

export interface DDropdownContextData {
  gVisible: boolean;
  gPopupTrigger: 'hover' | 'click';
  gFocusId: [string, string] | null;
  gOnItemClick: (id: string) => void;
  gOnFocus: (dId: string, id: string) => void;
  gOnBlur: () => void;
}
export const DDropdownContext = React.createContext<DDropdownContextData | null>(null);

export interface DDropdownProps extends React.HTMLAttributes<HTMLElement> {
  dTriggerNode: React.ReactNode;
  dVisible?: [boolean, DUpdater<boolean>?];
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

const { COMPONENT_NAME } = generateComponentMate('DDropdown');
export function DDropdown(props: DDropdownProps): JSX.Element | null {
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
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const [t] = useTranslation('Common');

  const asyncCapture = useAsync();

  const [focusId, setFocusId] = useImmer<DDropdownContextData['gFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const [visible, changeVisible] = useTwoWayBinding<boolean>(false, dVisible, onVisibleChange);

  const uniqueId = useId();
  const _id = id ?? `${dPrefix}dropdown-${uniqueId}`;

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

  const gOnItemClick = useCallback(
    (id) => {
      onItemClick?.(id);

      // The `DPopup` will emit `onVisibleChange` callback when click popup.
      // So use `setTimeout` make sure change visible.
      if (dCloseOnItemClick) {
        asyncCapture.setTimeout(() => {
          changeVisible(false);
        }, 20);
      }
    },
    [asyncCapture, changeVisible, dCloseOnItemClick, onItemClick]
  );
  const gOnFocus = useCallback(
    (dId, id) => {
      setFocusId([dId, id]);
    },
    [setFocusId]
  );
  const gOnBlur = useCallback(() => {
    setFocusId(null);
  }, [setFocusId]);
  const contextValue = useMemo<DDropdownContextData>(
    () => ({
      gVisible: visible,
      gPopupTrigger: dSubTrigger,
      gFocusId: focusId,
      gOnItemClick,
      gOnFocus,
      gOnBlur,
    }),
    [dSubTrigger, focusId, gOnBlur, gOnFocus, gOnItemClick, visible]
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
            {React.Children.count(children) === 0 ? <span className={`${dPrefix}dropdown__empty`}>{t('No Data')}</span> : children}
          </nav>
        }
        dCustomPopup={(popupEl, targetEl) => {
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
        }}
        dTriggerRender={({ onMouseEnter, onMouseLeave, onFocus, onBlur, onClick, ...renderProps }) => {
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
        }}
        dDestroy={dDestroy}
        dArrow={dArrow}
        onVisibleChange={changeVisible}
      ></DPopup>
    </DDropdownContext.Provider>
  );
}
