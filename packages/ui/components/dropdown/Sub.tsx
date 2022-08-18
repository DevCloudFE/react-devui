import type { Subject } from 'rxjs';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useElement } from '@react-devui/hooks';
import { RightOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName, getHorizontalSidePosition, getOriginalSize } from '@react-devui/utils';

import { usePrefixConfig, useTranslation, useMaxIndex } from '../../hooks';
import { TTANSITION_DURING_POPUP } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';

export interface DSubProps {
  children: React.ReactNode;
  dId: string;
  dFocusVisible: boolean;
  dPopup: React.ReactNode;
  dPopupVisible: boolean;
  dPopupState: boolean;
  dEmpty: boolean;
  dTrigger: 'hover' | 'click';
  dIcon?: React.ReactNode;
  dLevel?: number;
  dDisabled?: boolean;
  onVisibleChange: (visible: boolean) => void;
  updatePosition$: Subject<void>;
}

export function DSub(props: DSubProps): JSX.Element | null {
  const {
    children,
    dId,
    dFocusVisible,
    dPopup,
    dPopupVisible,
    dPopupState,
    dEmpty,
    dTrigger,
    dIcon,
    dLevel = 0,
    dDisabled,
    onVisibleChange,
    updatePosition$,
  } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const ulRef = useRef<HTMLUListElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  //#endregion

  const [t] = useTranslation();

  const containerEl = useElement(() => {
    let el = document.getElementById(`${dPrefix}dropdown-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}dropdown-root`;
      document.body.appendChild(el);
    }
    return el;
  });

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: -9999,
    left: -9999,
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useCallback(() => {
    if (ulRef.current && liRef.current) {
      const { width, height } = getOriginalSize(ulRef.current);
      const { top, left, transformOrigin } = getHorizontalSidePosition(liRef.current, { width, height }, 'right', 10);
      setPopupPositionStyle({
        top,
        left,
      });
      setTransformOrigin(transformOrigin);
    }
  }, []);

  const maxZIndex = useMaxIndex(dPopupVisible);

  useEffect(() => {
    if (dPopupVisible) {
      const ob = updatePosition$.subscribe({
        next: () => {
          updatePosition();
        },
      });

      return () => {
        ob.unsubscribe();
      };
    }
  }, [dPopupVisible, updatePosition, updatePosition$]);

  return (
    <DPopup
      dPopup={({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
        <DTransition dIn={dPopupVisible} dDuring={TTANSITION_DURING_POPUP} onEnterRendered={updatePosition}>
          {(state) => {
            let transitionStyle: React.CSSProperties = {};
            switch (state) {
              case 'enter':
                transitionStyle = { transform: 'scale(0)', opacity: 0 };
                break;

              case 'entering':
                transitionStyle = {
                  transition: ['transform', 'opacity'].map((attr) => `${attr} ${TTANSITION_DURING_POPUP}ms ease-out`).join(', '),
                  transformOrigin,
                };
                break;

              case 'leaving':
                transitionStyle = {
                  transform: 'scale(0)',
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

            return (
              <ul
                {...restPProps}
                ref={ulRef}
                className={`${dPrefix}dropdown__sub-popup`}
                style={{
                  ...popupPositionStyle,
                  ...transitionStyle,
                  zIndex: maxZIndex,
                }}
                role="menu"
                aria-labelledby={dId}
                onClick={pOnClick}
                onMouseEnter={pOnMouseEnter}
                onMouseLeave={pOnMouseLeave}
              >
                {dEmpty ? (
                  <div className={`${dPrefix}dropdown__empty`} style={{ paddingLeft: 12 + dLevel * 16 }}>
                    {t('No Data')}
                  </div>
                ) : (
                  dPopup
                )}
              </ul>
            );
          }}
        </DTransition>
      )}
      dVisible={dPopupState}
      dContainer={containerEl}
      dDisabled={dDisabled}
      dTrigger={dTrigger}
      dUpdatePosition={updatePosition}
      onVisibleChange={onVisibleChange}
    >
      {({ pOnClick, pOnMouseEnter, pOnMouseLeave, ...restPProps }) => (
        <li
          {...restPProps}
          ref={liRef}
          id={dId}
          className={getClassName(`${dPrefix}dropdown__item`, `${dPrefix}dropdown__item--sub`, {
            'is-expand': dPopupVisible,
            'is-disabled': dDisabled,
          })}
          style={{ paddingLeft: 12 + dLevel * 16 }}
          role="menuitem"
          aria-haspopup
          aria-expanded={dPopupVisible}
          aria-disabled={dDisabled}
          onClick={pOnClick}
          onMouseEnter={pOnMouseEnter}
          onMouseLeave={pOnMouseLeave}
        >
          {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
          {checkNodeExist(dIcon) && <div className={`${dPrefix}dropdown__item-icon`}>{dIcon}</div>}
          <div className={`${dPrefix}dropdown__item-content`}>{children}</div>
          <RightOutlined className={`${dPrefix}dropdown__sub-arrow`} dSize={14} />
        </li>
      )}
    </DPopup>
  );
}
