import type { DMenuMode } from './Menu';

import { isUndefined } from 'lodash';
import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import ReactDOM from 'react-dom';

import { useEventCallback, useRefExtra } from '@react-devui/hooks';
import { checkNodeExist, getClassName, getHorizontalSidePosition, getOriginalSize, getVerticalSidePosition } from '@react-devui/utils';

import { useMaxIndex } from '../../hooks';
import { TTANSITION_DURING_BASE, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition, DTransition } from '../_transition';
import { usePrefixConfig, useTranslation } from '../root';

export interface DSubProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dStep: number;
  dSpace: number;
  dIcon: React.ReactNode | undefined;
  dList: React.ReactNode;
  dPopupState: boolean | undefined;
  dTrigger: 'hover' | 'click';
  dPosinset: [number, number];
  dMode: DMenuMode;
  dInNav: boolean;
  dActive: boolean;
  dExpand: boolean;
  dEmpty: boolean;
  dFocusVisible: boolean;
  dDisabled: boolean;
  onVisibleChange: (visible: boolean) => void;
  onSubClick: React.MouseEventHandler<HTMLLIElement>;
}

function Sub(props: DSubProps, ref: React.ForwardedRef<() => void>): JSX.Element | null {
  const {
    children,
    dId,
    dLevel,
    dStep,
    dSpace,
    dIcon,
    dList,
    dPopupState,
    dTrigger,
    dPosinset,
    dMode,
    dInNav,
    dActive,
    dExpand,
    dEmpty,
    dFocusVisible,
    dDisabled,
    onVisibleChange,
    onSubClick,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const liRef = useRef<HTMLLIElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}menu-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}menu-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  //#endregion

  const dataRef = useRef<{
    nodeCache?: React.ReactNode;
  }>({});

  const [t] = useTranslation();

  const isVisible = !isUndefined(dPopupState);
  const inHorizontalNav = dMode === 'horizontal' && dInNav;

  const _iconMode = dMode === 'icon' && dInNav;
  const [iconMode, setIconMode] = useState(_iconMode);
  useEffect(() => {
    setIconMode(_iconMode);
  }, [_iconMode]);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (isVisible && ulRef.current && liRef.current) {
      const size = getOriginalSize(ulRef.current);
      const height = size.height;

      let width = size.width;
      if (inHorizontalNav) {
        width = liRef.current.getBoundingClientRect().width - 32;
      }

      const { top, left, transformOrigin } = inHorizontalNav
        ? getVerticalSidePosition(
            liRef.current,
            { width, height },
            {
              placement: 'bottom',
              offset: 12,
              inWindow: WINDOW_SPACE,
            }
          )
        : getHorizontalSidePosition(
            liRef.current,
            { width, height },
            {
              placement: 'right',
              offset: dInNav ? 10 : 14,
              inWindow: WINDOW_SPACE,
            }
          );
      setPopupPositionStyle({
        top,
        left,
        width: inHorizontalNav ? width : undefined,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  const maxZIndex = useMaxIndex(isVisible);

  useImperativeHandle(ref, () => updatePosition, [updatePosition]);

  const liNode = (
    <li
      ref={liRef}
      id={dId}
      className={getClassName(`${dPrefix}menu__item`, `${dPrefix}menu__item--sub`, {
        [`${dPrefix}menu__item--horizontal`]: inHorizontalNav,
        [`${dPrefix}menu__item--icon`]: iconMode,
        'is-active': dActive,
        'is-expand': dMode === 'vertical' ? dExpand : isVisible,
        'is-disabled': dDisabled,
      })}
      style={{ paddingLeft: dSpace + dLevel * dStep }}
      role="menuitem"
      aria-haspopup
      aria-expanded={dMode === 'vertical' ? dExpand : isVisible}
      aria-disabled={dDisabled}
      onClick={(e) => {
        onSubClick(e);
      }}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      <div
        className={getClassName(`${dPrefix}menu__indicator`, {
          [`${dPrefix}menu__indicator--first`]: dPosinset[0] === 0 && dPosinset[1] > 1,
          [`${dPrefix}menu__indicator--last`]: dPosinset[0] === dPosinset[1] - 1 && dPosinset[1] > 1,
        })}
      >
        <div style={{ backgroundColor: dLevel === 0 ? 'transparent' : undefined }}></div>
      </div>
      {checkNodeExist(dIcon) && <div className={`${dPrefix}menu__item-icon`}>{dIcon}</div>}
      <div className={`${dPrefix}menu__item-content`}>{children}</div>
      {!inHorizontalNav && (
        <div
          className={getClassName(`${dPrefix}menu__sub-arrow`, {
            [`${dPrefix}menu__sub-arrow--horizontal`]: dMode !== 'vertical' && !inHorizontalNav,
            'is-expand': dMode === 'vertical' && dExpand,
          })}
          aria-hidden
        >
          <div></div>
          <div></div>
        </div>
      )}
    </li>
  );

  return (
    <>
      {dDisabled || dMode === 'vertical' ? (
        liNode
      ) : (
        <DPopup
          dVisible={dPopupState ?? false}
          dTrigger={dTrigger}
          dUpdatePosition={{
            fn: updatePosition,
            triggerRef: liRef,
            popupRef: ulRef,
            extraScrollRefs: [],
          }}
          onVisibleChange={onVisibleChange}
        >
          {({ renderTrigger, renderPopup }) => (
            <>
              {renderTrigger(liNode)}
              {containerRef.current &&
                ReactDOM.createPortal(
                  <DTransition dIn={isVisible} dDuring={TTANSITION_DURING_POPUP} onEnter={updatePosition}>
                    {(state) => {
                      let transitionStyle: React.CSSProperties = {};
                      switch (state) {
                        case 'enter':
                          transitionStyle = { transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)', opacity: 0 };
                          break;

                        case 'entering':
                          transitionStyle = {
                            transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                            transformOrigin,
                          };
                          break;

                        case 'leaving':
                          transitionStyle = {
                            transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)',
                            opacity: 0,
                            transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-in`).join(', '),
                            transformOrigin,
                          };
                          break;

                        case 'leaved':
                          transitionStyle = { display: 'none' };
                          break;

                        default:
                          break;
                      }

                      return renderPopup(
                        <ul
                          ref={ulRef}
                          className={getClassName(`${dPrefix}menu__sub-list`, `${dPrefix}menu__sub-list--popup`)}
                          style={{
                            ...popupPositionStyle,
                            minWidth: inHorizontalNav ? undefined : 160,
                            zIndex: maxZIndex,
                            ...transitionStyle,
                          }}
                          role="menu"
                          aria-labelledby={dId}
                        >
                          {dEmpty ? (
                            <div className={`${dPrefix}menu__empty`} style={{ paddingLeft: dSpace + dLevel * dStep }}>
                              {t('No Data')}
                            </div>
                          ) : (
                            dList
                          )}
                        </ul>
                      );
                    }}
                  </DTransition>,
                  containerRef.current
                )}
            </>
          )}
        </DPopup>
      )}
      <DCollapseTransition
        dOriginalSize={{
          height: 'auto',
        }}
        dCollapsedStyle={{
          height: 0,
        }}
        dIn={dMode === 'vertical' ? dExpand : false}
        dDuring={TTANSITION_DURING_BASE}
        dStyles={{
          entering: {
            transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-out`).join(', '),
          },
          leaving: {
            transition: ['height', 'padding', 'margin'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms ease-in`).join(', '),
          },
          leaved: { display: 'none' },
        }}
      >
        {(collapseRef, collapseStyle, state) => {
          const node: React.ReactNode =
            dMode === 'vertical' ? (
              <ul ref={collapseRef} className={`${dPrefix}menu__sub-list`} style={collapseStyle} role="menu" aria-labelledby={dId}>
                {dEmpty ? (
                  <div className={`${dPrefix}menu__empty`} style={{ paddingLeft: dSpace + (dLevel + 1) * dStep }}>
                    {t('No Data')}
                  </div>
                ) : (
                  dList
                )}
              </ul>
            ) : dInNav && state !== 'leaved' && React.isValidElement(dataRef.current.nodeCache) ? (
              React.cloneElement(dataRef.current.nodeCache as React.ReactElement, { style: collapseStyle })
            ) : null;
          if (dMode === 'vertical' && dInNav) {
            dataRef.current.nodeCache = node;
          }

          return node;
        }}
      </DCollapseTransition>
    </>
  );
}

export const DSub = React.forwardRef(Sub);
