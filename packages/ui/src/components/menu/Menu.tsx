import { enableMapSet } from 'immer';
import { isUndefined } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useManualOrAutoState } from '../../hooks';
import { getClassName } from '../../utils';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';
import { generateChildren } from './utils';

enableMapSet();

export type DMenuContextData = {
  dMode: 'horizontal' | 'vertical' | 'popup' | 'icon';
  dExpandTrigger: 'hover' | 'click';
  dExpandOne: boolean;
  activeId: string | null;
  onActiveChange: (id: string) => void;
  currentExpandId: string | null;
  onExpandChange: (id: string, expand: boolean) => void;
  inMenu: boolean;
  currentData: {
    ids: Map<string, string[]>;
    expands: Set<string>;
  };
} | null;
export const DMenuContext = React.createContext<DMenuContextData>(null);

export interface DMenuProps extends React.HTMLAttributes<HTMLElement> {
  dActive?: string;
  dDefaultActive?: string;
  dDefaultExpands?: string[];
  dMode?: 'horizontal' | 'vertical' | 'popup' | 'icon';
  dExpandOne?: boolean;
  dExpandTrigger?: 'hover' | 'click';
  dHeader?: React.ReactNode;
  dFooter?: React.ReactNode;
  onActiveChange?: (id: string) => void;
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
    dHeader,
    dFooter,
    onActiveChange,
    onExpandsChange,
    className,
    children,
    ...restProps
  } = useDComponentConfig('menu', props);

  const dPrefix = useDPrefixConfig();

  const [activeId, dispatchActiveId] = useManualOrAutoState(dDefaultActive ?? null, dActive);

  const [currentData] = useState({
    ids: new Map<string, string[]>(),
    expands: new Set(dDefaultExpands),
  });

  //#region States.
  /*
   * @see https://reactjs.org/docs/state-and-lifecycle.html
   *
   * - Vue: data.
   * @see https://v3.vuejs.org/api/options-data.html#data-2
   * - Angular: property on a class.
   * @example
   * export class HeroChildComponent {
   *   public data: 'example';
   * }
   */
  const [focusId, setFocusId] = useImmer(new Set<string>());

  const [currentExpandId, setCurrentExpandId] = useImmer<string | null>(null);

  const [inMenu, setInMenu] = useImmer(false);
  //#endregion

  //#region Getters.
  /*
   * When the dependency changes, recalculate the value.
   * In React, usually use `useMemo` to handle this situation.
   * Notice: `useCallback` also as getter that target at function.
   *
   * - Vue: computed.
   * @see https://v3.vuejs.org/guide/computed.html#computed-properties
   * - Angular: get property on a class.
   * @example
   * // ReactConvertService is a service that implement the
   * // methods when need to convert react to angular.
   * export class HeroChildComponent {
   *   public get data():string {
   *     return this.reactConvert.useMemo(factory, [deps]);
   *   }
   *
   *   constructor(private reactConvert: ReactConvertService) {}
   * }
   */
  const handleTrigger = useCallback(
    (val) => {
      setInMenu(val);
    },
    [setInMenu]
  );

  const _onActiveChange = useCallback(
    (id) => {
      onActiveChange?.(id);
      dispatchActiveId({ value: id });
    },
    [onActiveChange, dispatchActiveId]
  );

  const onExpandChange = useCallback(
    (id: string, expand: boolean) => {
      setCurrentExpandId(expand ? id : null);
      onExpandsChange?.(Array.from(currentData.expands));
    },
    [onExpandsChange, currentData, setCurrentExpandId]
  );
  //#endregion

  //#region React.cloneElement.
  /*
   * @see https://reactjs.org/docs/react-api.html#cloneelement
   *
   * - Vue: Scoped Slots.
   * @see https://v3.vuejs.org/guide/component-slots.html#scoped-slots
   * - Angular: NgTemplateOutlet.
   * @see https://angular.io/api/common/NgTemplateOutlet
   */
  const childs = useMemo(() => {
    const arr: string[] = [];
    const _childs = generateChildren(children).map((child, index) => {
      arr.push(child.props.id);

      let tabIndex = child.props.tabIndex;
      if (index === 0) {
        tabIndex = 0;
      }

      return React.cloneElement(child, {
        ...child.props,
        tabIndex,
        __navMenu: true,
        __onFocus: (id: string) => {
          setFocusId((draft) => {
            draft.add(id);
          });
        },
        __onBlur: (id: string) => {
          setFocusId((draft) => {
            draft.delete(id);
          });
        },
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentData.ids.set(Symbol('menu') as any, arr);
    return _childs;
  }, [children, currentData, setFocusId]);
  //#endregion

  const contextValue = useMemo(
    () => ({
      dMode,
      dExpandTrigger: isUndefined(dExpandTrigger) ? (dMode === 'vertical' ? 'click' : 'hover') : dExpandTrigger,
      dExpandOne,
      activeId,
      onActiveChange: _onActiveChange,
      currentExpandId,
      onExpandChange,
      inMenu,
      currentData,
    }),
    [dMode, dExpandTrigger, dExpandOne, activeId, _onActiveChange, currentExpandId, onExpandChange, inMenu, currentData]
  );

  return (
    <DMenuContext.Provider value={contextValue}>
      <DCollapseTransition dVisible={dMode !== 'icon'} dDirection="width" dDuring={200} dSpace={80}>
        <DTrigger dTrigger="hover" onTrigger={handleTrigger}>
          <nav
            {...restProps}
            className={getClassName(className, `${dPrefix}menu`, {
              'is-horizontal': dMode === 'horizontal',
            })}
            tabIndex={-1}
            role="menubar"
            aria-orientation={dMode === 'horizontal' ? 'horizontal' : 'vertical'}
            aria-activedescendant={Array.from(focusId)[0] ?? undefined}
          >
            {dHeader}
            {childs}
            {dFooter}
          </nav>
        </DTrigger>
      </DCollapseTransition>
    </DMenuContext.Provider>
  );
}
