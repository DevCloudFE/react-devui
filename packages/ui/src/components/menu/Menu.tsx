import type { DMenuItemProps } from './MenuItem';

import { enableMapSet } from 'immer';
import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useManualOrAutoState, useCustomRef } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';

enableMapSet();

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
  dActive?: string;
  dDefaultActive?: string;
  dDefaultExpands?: string[];
  dMode?: DMenuMode;
  dExpandOne?: boolean;
  dExpandTrigger?: 'hover' | 'click';
  onActiveChange?: (id: string | null) => void;
  onExpandsChange?: (ids: string[]) => void;
}

export function DMenu(props: DMenuProps) {
  const {
    dActive,
    dDefaultActive,
    dDefaultExpands,
    dMode = 'vertical',
    dExpandOne = false,
    dExpandTrigger,
    onActiveChange,
    onExpandsChange,
    className,
    children,
    ...restProps
  } = useDComponentConfig('menu', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useCustomRef<HTMLElement>();
  //#endregion

  const [currentData] = useState<DMenuContextData['menuCurrentData']>({
    navIds: new Set(),
    ids: new Map(),
  });

  const [focusId, setFocusId] = useImmer<DMenuContextData['menuFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);
  const [expandIds, setExpandIds] = useImmer(() => new Set(dDefaultExpands));

  const [activeId, dispatchActiveId] = useManualOrAutoState(dDefaultActive ?? null, dActive, onActiveChange);
  const expandTrigger = isUndefined(dExpandTrigger) ? (dMode === 'vertical' ? 'click' : 'hover') : dExpandTrigger;

  const handleTrigger = useCallback(
    (val) => {
      if (dMode === 'vertical' && expandTrigger === 'hover' && !val) {
        setExpandIds((draft) => {
          draft.clear();
        });
      }
    },
    [expandTrigger, dMode, setExpandIds]
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
  }, [focusId, navEl, setActiveDescendant]);

  useEffect(() => {
    onExpandsChange?.(Array.from(expandIds));
  }, [expandIds, onExpandsChange]);
  //#endregion

  const contextValue = useMemo<DMenuContextData>(
    () => ({
      menuMode: dMode,
      menuExpandTrigger: expandTrigger,
      menuActiveId: activeId,
      menuExpandIds: expandIds,
      menuFocusId: focusId,
      menuCurrentData: currentData,
      onActiveChange: (id) => {
        dispatchActiveId({ value: id });
      },
      onExpandChange: (id, expand) => {
        setExpandIds((draft) => {
          if (expand) {
            if (dExpandOne) {
              for (const ids of [...Array.from(currentData.ids.values()), currentData.navIds]) {
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
    [activeId, currentData, dExpandOne, dMode, dispatchActiveId, expandIds, expandTrigger, focusId, setExpandIds, setFocusId]
  );

  const childs = useMemo(() => {
    currentData.navIds.clear();
    currentData.ids.clear();

    const getAllIds = (child: React.ReactElement) => {
      if (child.props?.dId) {
        const nodes = (React.Children.toArray(child.props?.children) as React.ReactElement[]).filter((node) => node.props?.dId);
        const ids = nodes.map((node) => node.props?.dId);
        currentData.ids.set(child.props?.dId, new Set(ids));

        nodes.forEach((node) => {
          getAllIds(node);
        });
      }
    };

    React.Children.toArray(children).forEach((node) => {
      getAllIds(node as React.ReactElement);
    });

    return React.Children.map(children as Array<React.ReactElement<DMenuItemProps>>, (child, index) => {
      child.props.dId && currentData.navIds.add(child.props.dId);

      let tabIndex = child.props.tabIndex;
      if (index === 0) {
        tabIndex = 0;
      }

      return React.cloneElement(child, {
        ...child.props,
        tabIndex,
      });
    });
  }, [children, currentData]);

  return (
    <DMenuContext.Provider value={contextValue}>
      <DCollapseTransition dEl={navEl} dVisible={dMode !== 'icon'} dDirection="width" dDuring={200} dSpace={80}>
        <DTrigger dTrigger="hover" onTrigger={handleTrigger}>
          <nav
            {...restProps}
            ref={navRef}
            className={getClassName(className, `${dPrefix}menu`, {
              'is-horizontal': dMode === 'horizontal',
            })}
            tabIndex={-1}
            role="menubar"
            aria-orientation={dMode === 'horizontal' ? 'horizontal' : 'vertical'}
            aria-activedescendant={activedescendant}
          >
            {childs}
          </nav>
        </DTrigger>
      </DCollapseTransition>
    </DMenuContext.Provider>
  );
}
