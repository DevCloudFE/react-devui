import type { Updater } from 'use-immer';

import { enableMapSet } from 'immer';
import { isUndefined } from 'lodash';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { useDPrefixConfig, useDComponentConfig, useCustomRef, useCustomContext, useAsync } from '../../hooks';
import { getClassName, getFixedSideStyle, toId } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition } from '../_transition';
import { DTrigger } from '../_trigger';
import { DIcon } from '../icon';
import { DMenuContext } from './Menu';
import { generateChildren, getAllIds } from './utils';

enableMapSet();

export type DMenuSubContextData = {
  setPopupIds: Updater<Set<string>>;
} | null;
export const DMenuSubContext = React.createContext<DMenuSubContextData>(null);

export interface DMenuSubProps extends React.LiHTMLAttributes<HTMLLIElement> {
  dId: string;
  dIcon?: React.ReactNode;
  dTitle: React.ReactNode;
  dDefaultExpand?: boolean;
  dDisabled?: boolean;
  __level?: number;
  __navMenu?: boolean;
  __onFocus?: (id: string) => void;
  __onBlur?: (id: string) => void;
}

export function DMenuSub(props: DMenuSubProps) {
  const {
    dId,
    dIcon,
    dTitle,
    dDefaultExpand,
    dDisabled = false,
    __level = 0,
    __navMenu = false,
    __onFocus,
    __onBlur,
    className,
    style,
    tabIndex,
    children,
    onFocus,
    onBlur,
    ...restProps
  } = useDComponentConfig('menu-sub', props);

  const dPrefix = useDPrefixConfig();
  const {
    dMode: _dMode,
    dExpandTrigger: _dExpandTrigger,
    dExpandOne: _dExpandOne,
    activeId: _activeId,
    currentExpandId: _currentExpandId,
    onExpandChange: _onExpandChange,
    inMenu: _inMenu,
    currentData: _currentData,
  } = useCustomContext(DMenuContext);
  const { setPopupIds: _setPopupIds } = useCustomContext(DMenuSubContext);

  const asyncCapture = useAsync();

  //#region Refs.
  /*
   * @see https://reactjs.org/docs/refs-and-the-dom.html
   *
   * - Vue: ref.
   * @see https://v3.vuejs.org/guide/component-template-refs.html
   * - Angular: ViewChild.
   * @see https://angular.io/api/core/ViewChild
   */
  const [liEl, liRef] = useCustomRef<HTMLElement>();
  //#endregion

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
  const [expand, setExpand] = useImmer(
    isUndefined(dDefaultExpand) ? Array.from(_currentData?.expands ?? []).includes(dId) : dDefaultExpand
  );
  const [visible, setVisible] = useImmer(false);
  const [currentVisible, setCurrentVisible] = useImmer(false);

  const [focusId, setFocusId] = useImmer(new Set<string>());

  const [menuWidth, setMenuWidth] = useImmer<number | undefined>(undefined);

  const [popupIds, setPopupIds] = useImmer(new Set<string>());

  const [popup, setPopup] = useImmer(_dMode !== 'vertical');
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
  const horizontal = useMemo(() => _dMode === 'horizontal' && __navMenu, [_dMode, __navMenu]);

  const customTransition = useCallback(
    (popupEl, targetEl) => {
      const { top, left, transformOrigin } = getFixedSideStyle(
        popupEl,
        targetEl,
        horizontal ? 'bottom' : 'right',
        horizontal ? 12 : __navMenu ? 10 : 18
      );
      setMenuWidth(targetEl.getBoundingClientRect().width - 32);
      return {
        top,
        left: horizontal ? left + 16 : left,
        stateList: {
          'enter-from': { transform: horizontal ? 'scaleY(0.7)' : 'scale(0)', opacity: '0' },
          'enter-to': { transition: 'transform 116ms ease-out, opacity 116ms ease-out', transformOrigin },
          'leave-to': {
            transform: horizontal ? 'scaleY(0.7)' : 'scale(0)',
            opacity: '0',
            transition: 'transform 116ms ease-in, opacity 116ms ease-in',
            transformOrigin,
          },
        },
      };
    },
    [__navMenu, horizontal, setMenuWidth]
  );

  const handleTrigger = useCallback(
    (val) => {
      if (_dExpandTrigger === 'click') {
        setExpand(!expand);
      } else if (val) {
        setExpand(true);
      }
    },
    [_dExpandTrigger, expand, setExpand]
  );

  const handleFocus = useCallback(
    (e) => {
      onFocus?.(e);
      __onFocus?.(`menu-sub-${toId(dId)}`);
    },
    [__onFocus, dId, onFocus]
  );

  const handleBlur = useCallback(
    (e) => {
      onBlur?.(e);
      __onBlur?.(`menu-sub-${toId(dId)}`);
    },
    [__onBlur, dId, onBlur]
  );

  const handlePopupTrigger = useCallback(
    (visible) => {
      if (visible) {
        setCurrentVisible(true);
      }
      setVisible(visible);
      _setPopupIds?.((draft) => {
        visible ? draft.add(dId) : draft.delete(dId);
      });
    },
    [_setPopupIds, dId, setVisible, setCurrentVisible]
  );
  //#endregion

  //#region DidUpdate.
  /*
   * We need a service(ReactConvertService) that implement useEffect.
   * @see https://reactjs.org/docs/hooks-effect.html
   *
   * - Vue: onUpdated.
   * @see https://v3.vuejs.org/api/composition-api.html#lifecycle-hooks
   * - Angular: ngDoCheck.
   * @see https://angular.io/api/core/DoCheck
   */
  useEffect(() => {
    if (_dMode === 'vertical' && !_inMenu && _dExpandTrigger === 'hover') {
      setExpand(false);
    }
  }, [_dMode, _inMenu, _dExpandTrigger, setExpand]);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();
    if (_dMode === 'popup' || _dMode === 'icon') {
      asyncGroup.setTimeout(() => {
        setPopup(true);
      }, 200 + 10);
    } else {
      setPopup(_dMode === 'horizontal');
    }
    return () => {
      asyncCapture.deleteGroup(asyncId);
    };
  }, [_dMode, asyncCapture, setPopup]);

  useEffect(() => {
    expand ? _currentData?.expands.add(dId) : _currentData?.expands.delete(dId);
    _onExpandChange?.(dId, expand);
    return () => {
      _currentData?.expands.delete(dId);
    };
  }, [_currentData, _onExpandChange, dId, expand]);

  useEffect(() => {
    if (_dExpandOne && _currentExpandId && _currentExpandId !== dId) {
      for (const ids of _currentData?.ids.values() ?? []) {
        if (ids.includes(_currentExpandId) && ids.includes(dId)) {
          setExpand(false);
        }
      }
    }
  }, [_dExpandOne, _currentExpandId, _currentData, dId, setExpand]);

  useEffect(() => {
    if (!visible && popupIds.size === 0) {
      setCurrentVisible(false);
    }
  }, [popupIds, visible, setCurrentVisible]);
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
    const _childs = generateChildren(children, !popup).map((child) => {
      arr.push(child.props.dId);
      return React.cloneElement(child, {
        ...child.props,
        __level: popup ? 0 : __level + 1,
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
    _currentData?.ids.set(dId, arr);
    return _childs;
  }, [__level, _currentData, dId, popup, children, setFocusId]);
  //#endregion

  const contextValue = useMemo(() => ({ setPopupIds }), [setPopupIds]);

  const menu = (
    <ul
      className={`${dPrefix}menu-list`}
      style={{
        width: horizontal ? menuWidth : undefined,
        minWidth: horizontal ? undefined : 160,
      }}
      role="menu"
      tabIndex={-1}
      aria-labelledby={`menu-sub-${toId(dId)}`}
      aria-orientation="vertical"
      aria-activedescendant={Array.from(focusId)[0] ?? undefined}
    >
      {childs}
    </ul>
  );

  return (
    <DMenuSubContext.Provider value={contextValue}>
      <DTrigger
        ref={liRef}
        dTrigger={popup ? undefined : _dExpandTrigger}
        dDisabled={dDisabled}
        dMouseEnterDelay={0}
        onTrigger={handleTrigger}
      >
        <li
          {...restProps}
          id={`menu-sub-${toId(dId)}`}
          className={getClassName(className, `${dPrefix}menu-sub`, {
            'is-active': (popup ? !currentVisible : !expand) && getAllIds(dId, _currentData?.ids).includes(_activeId as string),
            'is-expand': popup ? currentVisible : expand,
            'is-horizontal': horizontal,
            'is-icon': _dMode === 'icon' && __navMenu,
          })}
          style={{
            ...style,
            paddingLeft: 16 + __level * 20,
          }}
          role="menuitem"
          tabIndex={isUndefined(tabIndex) ? -1 : tabIndex}
          aria-haspopup={true}
          aria-expanded={popup ? currentVisible : expand}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <div className={`${dPrefix}menu-sub__indicator`}>
            <div style={{ backgroundColor: __level === 0 ? 'transparent' : undefined }}></div>
          </div>
          {dIcon && <div className={`${dPrefix}menu-sub__icon`}>{dIcon}</div>}
          <div className={`${dPrefix}menu-sub__title`}>{dTitle}</div>
          <DIcon
            className={`${dPrefix}menu-sub__arrow`}
            dSize={14}
            dRotate={
              (_dMode === 'popup' || popup) && !horizontal
                ? -90
                : (horizontal && currentVisible) || (_dMode === 'vertical' && expand)
                ? 180
                : undefined
            }
          >
            <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
          </DIcon>
        </li>
      </DTrigger>
      {!dDisabled &&
        (popup ? (
          <DPopup
            className={`${dPrefix}menu-sub__popup`}
            dVisible={currentVisible}
            dTrigger={_dExpandTrigger}
            dTarget={liEl}
            dArrow={false}
            dCustomPopup={customTransition}
            onTrigger={handlePopupTrigger}
          >
            {menu}
          </DPopup>
        ) : (
          <DCollapseTransition
            dVisible={_dMode !== 'vertical' && __level === 0 ? false : expand}
            dSkipFirst={!expand}
            dDirection="height"
            dDuring={200}
          >
            {menu}
          </DCollapseTransition>
        ))}
    </DMenuSubContext.Provider>
  );
}
