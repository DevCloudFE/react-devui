import type { Updater } from '../../hooks/two-way-binding';
import type { DMenuItemProps } from './MenuItem';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useRefCallback, useTwoWayBinding } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';

type DMenuMode = 'horizontal' | 'vertical' | 'popup' | 'icon';

export interface DMenuContextData {
  menuMode: DMenuMode;
  menuExpandTrigger?: 'hover' | 'click';
  menuActiveId: string | null;
  menuExpandIds: Set<string>;
  menuFocusId: [string, string] | null;
  menuCurrentData: {
    navIds: Set<string>;
    ids: Map<string, Set<string>>;
  };
  onActiveChange: (id: string) => void;
  onExpandChange: (id: string, expand: boolean) => void;
  onFocus: (dId: string, id: string) => void;
  onBlur: () => void;
}
export const DMenuContext = React.createContext<DMenuContextData | null>(null);

export interface DMenuProps extends React.HTMLAttributes<HTMLElement> {
  dActive?: [string | null, Updater<string | null>?];
  dExpands?: [Set<string>, Updater<Set<string>>?];
  dMode?: DMenuMode;
  dExpandOne?: boolean;
  dExpandTrigger?: 'hover' | 'click';
  onActiveChange?: (id: string) => void;
  onExpandsChange?: (ids: Set<string>) => void;
}

export function DMenu(props: DMenuProps) {
  const {
    dActive,
    dExpands,
    dMode = 'vertical',
    dExpandOne = false,
    dExpandTrigger,
    onActiveChange,
    onExpandsChange,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onClick,
    ...restProps
  } = useComponentConfig(DMenu.name, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const dataRef = useRef<DMenuContextData['menuCurrentData']>({
    navIds: new Set(),
    ids: new Map(),
  });

  const [focusId, setFocusId] = useImmer<DMenuContextData['menuFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const [activeId, changeActiveId] = useTwoWayBinding<string | null>(null, dActive, onActiveChange);
  const [expandIds, changeExpandIds] = useTwoWayBinding(new Set<string>(), dExpands, onExpandsChange);

  const expandTrigger = isUndefined(dExpandTrigger) ? (dMode === 'vertical' ? 'click' : 'hover') : dExpandTrigger;

  const handleTrigger = useCallback(
    (val) => {
      if (dMode === 'vertical' && expandTrigger === 'hover' && !val) {
        changeExpandIds(new Set());
      }
    },
    [dMode, expandTrigger, changeExpandIds]
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

  const contextValue = useMemo<DMenuContextData>(
    () => ({
      menuMode: dMode,
      menuExpandTrigger: expandTrigger,
      menuActiveId: activeId,
      menuExpandIds: expandIds,
      menuFocusId: focusId,
      menuCurrentData: dataRef.current,
      onActiveChange: (id) => {
        changeActiveId(id);
      },
      onExpandChange: (id, expand) => {
        changeExpandIds((draft) => {
          if (expand) {
            if (dExpandOne) {
              for (const ids of [...Array.from(dataRef.current.ids.values()), dataRef.current.navIds]) {
                if (ids.has(id)) {
                  for (const sameLevelId of ids) {
                    draft.delete(sameLevelId);
                  }
                  break;
                }
              }
            }
            draft.add(id);
          } else {
            draft.delete(id);
          }
        });
      },
      onFocus: (dId, id) => {
        setFocusId([dId, id]);
      },
      onBlur: () => {
        setFocusId(null);
      },
    }),
    [activeId, changeActiveId, changeExpandIds, dExpandOne, dMode, expandIds, expandTrigger, focusId, setFocusId]
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

    return React.Children.map(children as Array<React.ReactElement<DMenuItemProps>>, (child, index) => {
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

  return (
    <DMenuContext.Provider value={contextValue}>
      <DCollapseTransition
        dEl={navEl}
        dVisible={dMode !== 'icon'}
        dDirection="horizontal"
        dDuring={200}
        dSpace={80}
        dRender={() => (
          <DTrigger
            dTrigger="hover"
            dRender={(triggerRenderProps) => (
              <nav
                {...restProps}
                ref={navRef}
                className={getClassName(className, `${dPrefix}menu`, {
                  [`${dPrefix}menu--horizontal`]: dMode === 'horizontal',
                })}
                tabIndex={-1}
                role="menubar"
                aria-orientation={dMode === 'horizontal' ? 'horizontal' : 'vertical'}
                aria-activedescendant={activedescendant}
                onMouseEnter={(e) => {
                  onMouseEnter?.(e);
                  triggerRenderProps.onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                  onMouseLeave?.(e);
                  triggerRenderProps.onMouseLeave?.(e);
                }}
                onClick={(e) => {
                  onClick?.(e);
                  triggerRenderProps.onClick?.(e);
                }}
              >
                {childs}
              </nav>
            )}
            onTrigger={handleTrigger}
          />
        )}
      />
    </DMenuContext.Provider>
  );
}
