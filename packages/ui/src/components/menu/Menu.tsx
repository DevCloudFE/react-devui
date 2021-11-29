import type { Updater } from '../../hooks/immer';
import type { DRenderProps } from '../_trigger';
import type { DMenuItemProps } from './MenuItem';

import { produce } from 'immer';
import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { useDPrefixConfig, useDComponentConfig, useImmer, useRefCallback, useTwoWayBinding } from '../../hooks';
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
  menuPopupIds: Map<string, Array<{ id: string; visible: boolean }>>;
  menuCurrentData: {
    navIds: Set<string>;
    ids: Map<string, Set<string>>;
  };
  onActiveChange: (id: string) => void;
  onExpandChange: (id: string, expand: boolean) => void;
  onPopupIdChange: (id: string, visible: boolean) => void;
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
  } = useDComponentConfig('menu', props);

  //#region Context
  const dPrefix = useDPrefixConfig();
  //#endregion

  //#region Ref
  const [navEl, navRef] = useRefCallback();
  //#endregion

  const dataRef = useRef<DMenuContextData['menuCurrentData']>({
    navIds: new Set(),
    ids: new Map(),
  });

  const [focusId, setFocusId] = useImmer<DMenuContextData['menuFocusId']>(null);
  const [activedescendant, setActiveDescendant] = useImmer<string | undefined>(undefined);
  const [popupIds, setPopupIds] = useImmer<DMenuContextData['menuPopupIds']>(() => new Map());

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
    if (dMode === 'vertical') {
      setPopupIds((draft) => {
        draft.clear();
      });
    }
  }, [dMode, setPopupIds]);

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
      menuPopupIds: popupIds,
      menuCurrentData: dataRef.current,
      onActiveChange: (id) => {
        changeActiveId(id);
      },
      onExpandChange: (id, expand) => {
        const newExpandIds = produce(expandIds, (draft) => {
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
        changeExpandIds(newExpandIds);
      },
      onPopupIdChange: (id, visible) => {
        setPopupIds((draft) => {
          if (visible) {
            let saved = null;
            for (const sameLevelIds of draft.values()) {
              saved = sameLevelIds.find((item) => item.id === id);
              if (saved) {
                saved.visible = true;
                break;
              }
            }
            if (!saved) {
              if (dataRef.current.navIds.has(id)) {
                draft.set(id, [{ id, visible }]);
              } else {
                for (const sameLevelIds of draft.values()) {
                  if (sameLevelIds.length > 0) {
                    const lastLevelId = sameLevelIds[sameLevelIds.length - 1].id;
                    if (dataRef.current.ids.get(lastLevelId)?.has(id)) {
                      sameLevelIds.push({ id, visible });
                      break;
                    }
                  }
                }
              }
            }
          } else {
            let hasFind = false;
            for (const sameLevelIds of draft.values()) {
              if (hasFind) {
                break;
              }
              for (const popup of sameLevelIds) {
                if (popup.id === id) {
                  popup.visible = visible;
                  hasFind = true;
                  break;
                }
              }
              if (hasFind) {
                for (let index = sameLevelIds.length - 1; index >= 0; index--) {
                  if (sameLevelIds[index].visible === false) {
                    sameLevelIds.pop();
                  } else {
                    break;
                  }
                }
              }
            }
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
    [activeId, changeActiveId, changeExpandIds, dExpandOne, dMode, expandIds, expandTrigger, focusId, popupIds, setFocusId, setPopupIds]
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

  const handleEvent = useCallback<(renderProps: DRenderProps) => React.HTMLAttributes<HTMLElement>>(
    (renderProps) => ({
      onMouseEnter: (e) => {
        onMouseEnter?.(e);
        renderProps.onMouseEnter?.(e);
      },
      onMouseLeave: (e) => {
        onMouseLeave?.(e);
        renderProps.onMouseLeave?.(e);
      },
      onFocus: (e) => {
        onFocus?.(e);
        renderProps.onFocus?.(e);
      },
      onBlur: (e) => {
        onBlur?.(e);
        renderProps.onBlur?.(e);
      },
      onClick: (e) => {
        onClick?.(e);
        renderProps.onClick?.(e);
      },
    }),
    [onBlur, onClick, onFocus, onMouseEnter, onMouseLeave]
  );

  return (
    <DMenuContext.Provider value={contextValue}>
      <DCollapseTransition
        dEl={navEl}
        dVisible={dMode !== 'icon'}
        dDirection="width"
        dDuring={200}
        dSpace={80}
        dRender={() => (
          <DTrigger
            dTrigger="hover"
            dRender={(triggerRenderProps) => (
              <nav
                {...restProps}
                {...handleEvent(triggerRenderProps)}
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
            )}
            onTrigger={handleTrigger}
          />
        )}
      />
    </DMenuContext.Provider>
  );
}
