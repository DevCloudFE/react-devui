import type { Updater } from '../../hooks/immer';
import type { DDropdownItemProps } from './DropdownItem';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDPrefixConfig, useDComponentConfig, useImmer, useRefCallback, useTwoWayBinding, useId, useAsync } from '../../hooks';
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
    onVisibleChange,
    onItemClick,
    id,
    className,
    children,
    ...restProps
  } = useDComponentConfig('dropdown', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const dataRef = useRef<{ navIds: Set<string>; ids: Map<string, Set<string>> }>({
    navIds: new Set(),
    ids: new Map(),
  });

  const asyncCapture = useAsync();

  const [focusId, setFocusId] = useImmer<DDropdownContextData['dropdownFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);

  const [visible, changeVisible] = useTwoWayBinding(false, dVisible, onVisibleChange);

  const _id = useId();
  const __id = id ?? `${dPrefix}dropdown-${_id}`;

  const customTransition = useCallback(
    (popupEl, targetEl) => {
      const { top, left, transformOrigin, arrowPosition } = getVerticalSideStyle(popupEl, targetEl, dPlacement, 12);

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

  //#region DidUpdate
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
  //#endregion

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
    dataRef.current.navIds.clear();
    dataRef.current.ids.clear();

    const getAllIds = (child: React.ReactElement) => {
      if (child.props?.dId) {
        const nodes = (React.Children.toArray(child.props?.children) as React.ReactElement[]).filter((node) => node.props?.dId);
        const ids = nodes.map((node) => node.props?.dId);
        dataRef.current.ids.set(child.props?.dId, new Set(ids));

        nodes.forEach((node) => {
          getAllIds(node);
        });
      }
    };

    React.Children.toArray(children).forEach((node) => {
      getAllIds(node as React.ReactElement);
    });

    return React.Children.map(children as Array<React.ReactElement<DDropdownItemProps>>, (child, index) => {
      child.props.dId && dataRef.current.navIds.add(child.props.dId);

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

  const triggerNode = React.Children.only(dTriggerNode) as React.ReactElement<React.HTMLAttributes<HTMLElement>>;

  return (
    <DDropdownContext.Provider value={contextValue}>
      <DPopup
        className={`${dPrefix}dropdown-popup`}
        dVisible={[visible]}
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
            {childs}
          </nav>
        }
        dCustomPopup={customTransition}
        dTriggerRender={(renderProps) =>
          React.cloneElement(triggerNode, {
            ...triggerNode.props,
            ...renderProps,
            role: 'button',
            'aria-haspopup': 'menu',
            'aria-expanded': visible ? true : undefined,
            'aria-controls': __id,
          })
        }
        dDestroy={dDestroy}
        dArrow={dArrow}
        onVisibleChange={changeVisible}
      ></DPopup>
    </DDropdownContext.Provider>
  );
}
