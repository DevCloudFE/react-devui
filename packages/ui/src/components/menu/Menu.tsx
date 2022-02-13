import type { Updater } from '../../hooks/two-way-binding';
import type { DMenuItemProps } from './MenuItem';

import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { usePrefixConfig, useComponentConfig, useImmer, useRefCallback, useTwoWayBinding, useDCollapseTransition } from '../../hooks';
import { generateComponentMate, getClassName, mergeStyle } from '../../utils';
import { DTrigger } from '../_trigger';
import { DMenuItem } from './MenuItem';
import { DMenuSub } from './MenuSub';

type DMenuMode = 'horizontal' | 'vertical' | 'popup' | 'icon';

export interface DMenuContextData {
  gMode: DMenuMode;
  gExpandTrigger?: 'hover' | 'click';
  gActiveId: string | null;
  gExpandIds: Set<string>;
  gFocusId: [string, string] | null;
  gOnActiveChange: (id: string) => void;
  gOnExpandChange: (id: string, expand: boolean) => void;
  gOnFocus: (dId: string, id: string) => void;
  gOnBlur: () => void;
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

const { COMPONENT_NAME } = generateComponentMate('DMenu');
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
    style,
    children,
    onMouseEnter,
    onMouseLeave,
    onClick,
    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const [focusId, setFocusId] = useImmer<DMenuContextData['gFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useState<string | undefined>(undefined);

  const [activeId, changeActiveId] = useTwoWayBinding<string | null, string>(null, dActive, onActiveChange);
  const [expandIds, changeExpandIds] = useTwoWayBinding<Set<string>>(new Set(), dExpands, onExpandsChange);

  const expandTrigger = isUndefined(dExpandTrigger) ? (dMode === 'vertical' ? 'click' : 'hover') : dExpandTrigger;

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

  const gOnActiveChange = useCallback(
    (id) => {
      changeActiveId(id);
    },
    [changeActiveId]
  );
  const gOnExpandChange = useCallback(
    (id, expand) => {
      changeExpandIds((draft) => {
        if (expand) {
          if (dExpandOne) {
            const idsArr: string[][] = [];
            const getAllIds = (childs: React.ReactNode) => {
              const nodes = React.Children.toArray(childs).filter((node) => node?.['props']?.dId);
              idsArr.push(nodes.map((node) => node['props'].dId));
              nodes.forEach((node) => {
                if (node?.['props']?.children) {
                  getAllIds(node['props'].children);
                }
              });
            };
            getAllIds(children);
            for (const ids of idsArr) {
              if (ids.includes(id)) {
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
    [changeExpandIds, children, dExpandOne]
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
  const contextValue = useMemo<DMenuContextData>(
    () => ({
      gMode: dMode,
      gExpandTrigger: expandTrigger,
      gActiveId: activeId,
      gExpandIds: expandIds,
      gFocusId: focusId,
      gOnActiveChange,
      gOnExpandChange,
      gOnFocus,
      gOnBlur,
    }),
    [activeId, dMode, expandIds, expandTrigger, focusId, gOnActiveChange, gOnBlur, gOnExpandChange, gOnFocus]
  );

  const childs = useMemo(() => {
    return React.Children.map(children as React.ReactElement<DMenuItemProps>[], (child, index) => {
      const props = Object.assign({}, child.props);

      if ('type' in child && (child.type === DMenuSub || child.type === DMenuItem)) {
        props.__inNav = true;
      }

      if (index === 0) {
        props.tabIndex = 0;
      }

      return React.cloneElement(child, props);
    });
  }, [children]);

  const transitionState = {
    'enter-from': { width: '80px' },
    'enter-to': { transition: 'width 0.2s linear' },
    'leave-to': { width: '80px', transition: 'width 0.2s linear' },
  };
  const hidden = useDCollapseTransition({
    dEl: navEl,
    dVisible: dMode !== 'icon',
    dCallbackList: {
      beforeEnter: () => transitionState,
      beforeLeave: () => transitionState,
    },
    dDirection: 'horizontal',
  });

  const handleTrigger = (state?: boolean) => {
    if (dMode === 'vertical' && expandTrigger === 'hover' && state === false) {
      changeExpandIds(new Set());
    }
  };

  return (
    <DMenuContext.Provider value={contextValue}>
      <DTrigger
        dTrigger="hover"
        dRender={(triggerRenderProps) => (
          <nav
            {...restProps}
            ref={navRef}
            className={getClassName(className, `${dPrefix}menu`, {
              [`${dPrefix}menu--horizontal`]: dMode === 'horizontal',
            })}
            style={mergeStyle(
              {
                width: hidden ? 80 : undefined,
              },
              style
            )}
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
    </DMenuContext.Provider>
  );
}
