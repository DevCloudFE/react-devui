import type { DMenuMode } from './Menu';

import { useState, useRef } from 'react';

import { usePrefixConfig, useTranslation, useElement, useEventCallback, useMaxIndex } from '../../hooks';
import { CaretDownOutlined } from '../../icons';
import { getClassName, getHorizontalSidePosition, getVerticalSidePosition, getNoTransformSize } from '../../utils';
import { DPopup } from '../_popup';
import { DCollapseTransition, DTransition } from '../_transition';

export interface DMenuSubProps {
  children: React.ReactNode;
  dId: string;
  dDisabled?: boolean;
  dPosinset: [number, number];
  dMode: DMenuMode;
  dInNav: boolean;
  dActive: boolean;
  dExpand: boolean;
  dFocusVisible: boolean;
  dList: React.ReactNode;
  dPopupVisible: boolean;
  dPopupState: boolean;
  dEmpty: boolean;
  dTrigger: 'hover' | 'click';
  dIcon?: React.ReactNode;
  dStep: number;
  dSpace: number;
  dLevel?: number;
  onVisibleChange: (visible: boolean) => void;
  onClick: React.MouseEventHandler<HTMLLIElement>;
}

const POPUP_TTANSITION_DURING = 116;
const COLLAPSE_TTANSITION_DURING = 200;
export function DMenuSub(props: DMenuSubProps): JSX.Element | null {
  const {
    children,
    dId,
    dDisabled,
    dPosinset,
    dMode,
    dInNav,
    dActive,
    dExpand,
    dFocusVisible,
    dList,
    dPopupVisible,
    dPopupState,
    dEmpty,
    dTrigger,
    dIcon,
    dStep,
    dSpace,
    dLevel = 0,
    onVisibleChange,
    onClick,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const popupRef = useRef<HTMLUListElement>(null);
  const collapseRef = useRef<HTMLUListElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  //#endregion

  const [t] = useTranslation('Common');

  const inHorizontalNav = dMode === 'horizontal' && dInNav;

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}menu-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}menu-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (popupRef.current && liRef.current) {
      const size = getNoTransformSize(popupRef.current);
      const height = size.height;

      let width = size.width;
      if (inHorizontalNav) {
        width = liRef.current.getBoundingClientRect().width - 32;
      }

      const { top, left, transformOrigin } = inHorizontalNav
        ? getVerticalSidePosition(liRef.current, { width, height }, 'bottom-left', 12)
        : getHorizontalSidePosition(liRef.current, { width, height }, 'right', dInNav ? 10 : 14);
      setPopupPositionStyle({
        top,
        left: inHorizontalNav ? left + 16 : left,
        width: inHorizontalNav ? width : undefined,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  const maxZIndex = useMaxIndex(dPopupVisible);

  const iconRotate = (() => {
    if (dMode === 'vertical' && dExpand) {
      return 180;
    }
    if (dMode !== 'vertical' && !inHorizontalNav) {
      return -90;
    }
    return undefined;
  })();

  return (
    <DCollapseTransition
      dRef={collapseRef}
      dSize={0}
      dIn={dMode === 'vertical' || !dInNav ? dExpand : false}
      dDuring={COLLAPSE_TTANSITION_DURING}
      dStyles={{
        entering: { transition: `height ${COLLAPSE_TTANSITION_DURING}ms ease-out` },
        leaving: { transition: `height ${COLLAPSE_TTANSITION_DURING}ms ease-in` },
        leaved: { display: 'none' },
      }}
    >
      {(collapseStyle, collapseState) => (
        <>
          <DTransition dIn={dPopupVisible} dDuring={POPUP_TTANSITION_DURING} onEnterRendered={updatePosition}>
            {(popupState) => {
              let popupTransitionStyle: React.CSSProperties = {};
              switch (popupState) {
                case 'enter':
                  popupTransitionStyle = { transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)', opacity: 0 };
                  break;

                case 'entering':
                  popupTransitionStyle = {
                    transition: `transform ${POPUP_TTANSITION_DURING}ms ease-out, opacity ${POPUP_TTANSITION_DURING}ms ease-out`,
                    transformOrigin,
                  };
                  break;

                case 'leaving':
                  popupTransitionStyle = {
                    transform: inHorizontalNav ? 'scaleY(0.7)' : 'scale(0)',
                    opacity: 0,
                    transition: `transform ${POPUP_TTANSITION_DURING}ms ease-in, opacity ${POPUP_TTANSITION_DURING}ms ease-in`,
                    transformOrigin,
                  };
                  break;

                case 'leaved':
                  popupTransitionStyle = { display: 'none' };
                  break;

                default:
                  break;
              }

              return (
                <DPopup
                  dDisabled={dDisabled || dMode === 'vertical'}
                  dVisible={dPopupState}
                  dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) => (
                    <ul
                      {...restPCProps}
                      ref={popupRef}
                      className={getClassName(`${dPrefix}menu-sub__list`, `${dPrefix}menu-sub__list--popup`)}
                      style={{
                        ...popupPositionStyle,
                        ...popupTransitionStyle,
                        minWidth: inHorizontalNav ? undefined : 160,
                        zIndex: maxZIndex,
                      }}
                      role="menu"
                      aria-labelledby={dId}
                      onClick={() => {
                        pOnClick?.();
                      }}
                      onMouseEnter={() => {
                        pOnMouseEnter?.();
                      }}
                      onMouseLeave={() => {
                        pOnMouseLeave?.();
                      }}
                    >
                      {dEmpty ? (
                        <div className={`${dPrefix}menu-sub__empty`} style={{ paddingLeft: dSpace + dLevel * dStep }}>
                          {t('No Data')}
                        </div>
                      ) : (
                        dList
                      )}
                    </ul>
                  )}
                  dContainer={containerEl}
                  dTrigger={dTrigger}
                  onVisibleChange={onVisibleChange}
                  onUpdate={updatePosition}
                >
                  {({ pOnClick, pOnFocus, pOnBlur, pOnMouseEnter, pOnMouseLeave, ...restPCProps }) => (
                    <li
                      {...restPCProps}
                      ref={liRef}
                      id={dId}
                      className={getClassName(`${dPrefix}menu-sub`, {
                        [`${dPrefix}menu-sub--horizontal`]: inHorizontalNav,
                        [`${dPrefix}menu-sub--icon`]: dMode === 'icon' && dInNav,
                        'is-active': dActive,
                        'is-expand': dMode === 'vertical' ? dExpand : dPopupVisible,
                        'is-disabled': dDisabled,
                      })}
                      style={{ paddingLeft: dSpace + dLevel * dStep }}
                      role="menuitem"
                      aria-haspopup={true}
                      aria-expanded={dMode === 'vertical' ? dExpand : dPopupVisible}
                      aria-disabled={dDisabled}
                      onClick={(e) => {
                        pOnClick?.();

                        onClick(e);
                      }}
                      onFocus={() => {
                        pOnFocus?.();
                      }}
                      onBlur={() => {
                        pOnBlur?.();
                      }}
                      onMouseEnter={() => {
                        pOnMouseEnter?.();
                      }}
                      onMouseLeave={() => {
                        pOnMouseLeave?.();
                      }}
                    >
                      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
                      <div
                        className={getClassName(`${dPrefix}menu-sub__indicator`, {
                          [`${dPrefix}menu-sub__indicator--first`]: dPosinset[0] === 0 && dPosinset[1] > 1,
                          [`${dPrefix}menu-sub__indicator--last`]: dPosinset[0] === dPosinset[1] - 1 && dPosinset[1] > 1,
                        })}
                      >
                        <div style={{ backgroundColor: dLevel === 0 ? 'transparent' : undefined }}></div>
                      </div>
                      {dIcon && <div className={`${dPrefix}menu-sub__icon`}>{dIcon}</div>}
                      <div className={`${dPrefix}menu-sub__title`}>{children}</div>
                      {!inHorizontalNav && <CaretDownOutlined className={`${dPrefix}menu-sub__arrow`} dSize={14} dRotate={iconRotate} />}
                    </li>
                  )}
                </DPopup>
              );
            }}
          </DTransition>
          {dMode !== 'vertical' && (collapseState === 'leaved' || !dInNav) ? null : (
            <ul ref={collapseRef} className={`${dPrefix}menu-sub__list`} style={collapseStyle} role="menu" aria-labelledby={dId}>
              {dEmpty ? (
                <div className={`${dPrefix}menu-sub__empty`} style={{ paddingLeft: dSpace + (dLevel + 1) * dStep }}>
                  {t('No Data')}
                </div>
              ) : (
                dList
              )}
            </ul>
          )}
        </>
      )}
    </DCollapseTransition>
  );
}
