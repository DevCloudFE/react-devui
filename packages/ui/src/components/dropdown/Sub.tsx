import { isUndefined } from 'lodash';
import React, { useImperativeHandle, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { useEventCallback, useRefExtra } from '@react-devui/hooks';
import { RightOutlined } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { getHorizontalSidePosition, TTANSITION_DURING_POPUP, WINDOW_SPACE } from '../../utils';
import { DPopup } from '../_popup';
import { DTransition } from '../_transition';
import { usePrefixConfig, useTranslation } from '../root';

export interface DSubProps {
  children: React.ReactNode;
  dId: string;
  dLevel: number;
  dIcon: React.ReactNode | undefined;
  dList: React.ReactNode;
  dPopupState: boolean | undefined;
  dTrigger: 'hover' | 'click';
  dZIndex: number | string | undefined;
  dEmpty: boolean;
  dFocusVisible: boolean;
  dDisabled: boolean;
  onVisibleChange: (visible: boolean) => void;
}

function Sub(props: DSubProps, ref: React.ForwardedRef<() => void>): JSX.Element | null {
  const { children, dId, dLevel, dIcon, dList, dPopupState, dTrigger, dZIndex, dEmpty, dFocusVisible, dDisabled, onVisibleChange } = props;

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const liRef = useRef<HTMLLIElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);
  const containerRef = useRefExtra(() => {
    let el = document.getElementById(`${dPrefix}dropdown-root`);
    if (!el) {
      el = document.createElement('div');
      el.id = `${dPrefix}dropdown-root`;
      document.body.appendChild(el);
    }
    return el;
  }, true);
  //#endregion

  const [t] = useTranslation();

  const isVisible = !isUndefined(dPopupState);

  const [popupPositionStyle, setPopupPositionStyle] = useState<React.CSSProperties>({
    top: '-200vh',
    left: '-200vw',
  });
  const [transformOrigin, setTransformOrigin] = useState<string>();
  const updatePosition = useEventCallback(() => {
    if (isVisible && ulRef.current && liRef.current) {
      const [width, height] = [ulRef.current.offsetWidth, ulRef.current.offsetHeight];
      const { top, left, transformOrigin } = getHorizontalSidePosition(
        liRef.current,
        { width, height },
        {
          placement: 'right',
          inWindow: WINDOW_SPACE,
        }
      );
      setPopupPositionStyle({
        top,
        left,
      });
      setTransformOrigin(transformOrigin);
    }
  });

  useImperativeHandle(ref, () => updatePosition, [updatePosition]);

  const liNode = (
    <li
      ref={liRef}
      id={dId}
      className={getClassName(`${dPrefix}dropdown__item`, `${dPrefix}dropdown__item--sub`, {
        'is-expand': isVisible,
        'is-disabled': dDisabled,
      })}
      style={{ paddingLeft: 12 + dLevel * 16 }}
      role="menuitem"
      aria-haspopup
      aria-expanded={isVisible}
      aria-disabled={dDisabled}
    >
      {dFocusVisible && <div className={`${dPrefix}focus-outline`}></div>}
      {checkNodeExist(dIcon) && <div className={`${dPrefix}dropdown__item-icon`}>{dIcon}</div>}
      <div className={`${dPrefix}dropdown__item-content`}>{children}</div>
      <RightOutlined className={`${dPrefix}dropdown__sub-arrow`} dSize={14} />
    </li>
  );

  return dDisabled ? (
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

                  return renderPopup(
                    <ul
                      ref={ulRef}
                      className={`${dPrefix}dropdown__sub-popup`}
                      style={{
                        ...popupPositionStyle,
                        zIndex: dZIndex,
                        ...transitionStyle,
                      }}
                      role="menu"
                    >
                      {dEmpty ? (
                        <div className={`${dPrefix}dropdown__empty`} style={{ paddingLeft: 12 + dLevel * 16 }}>
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
  );
}

export const DSub = React.forwardRef(Sub);
