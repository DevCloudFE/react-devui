import type { DTransitionState } from '../_transition';

import { isNumber, isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';

import { useAsync, useForceUpdate } from '@react-devui/hooks';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { usePrefixConfig, useComponentConfig } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';

export interface DSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dText?: React.ReactNode;
  dDelay?: number;
  dSize?: number;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSpinner' });
export function DSpinner(props: DSpinnerProps): JSX.Element | null {
  const {
    children,
    dVisible = true,
    dText,
    dDelay,
    dSize = '28px',
    afterVisibleChange,

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  //#endregion

  //#region Ref
  const spinnerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  //#endregion

  const asyncCapture = useAsync();
  const forceUpdate = useForceUpdate();

  const delayVisible = useRef(false);
  if (dVisible === false) {
    delayVisible.current = false;
  }
  const visible = isUndefined(dDelay) ? dVisible : delayVisible.current;

  const transitionStyles: Partial<Record<DTransitionState, React.CSSProperties>> = {
    enter: { opacity: 0 },
    entering: {
      transition: ['opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms linear`).join(', '),
    },
    leaving: {
      opacity: 0,
      transition: ['opacity'].map((attr) => `${attr} ${TTANSITION_DURING_BASE}ms linear`).join(', '),
    },
    leaved: { display: 'none' },
  };

  useEffect(() => {
    if (isNumber(dDelay) && dVisible) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.setTimeout(() => {
        delayVisible.current = true;
        forceUpdate();
      }, dDelay);

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, dDelay, dVisible, forceUpdate]);

  return (
    <DTransition
      dIn={visible}
      dDuring={TTANSITION_DURING_BASE}
      onEnterRendered={() => {
        if (spinnerRef.current && containerRef.current) {
          containerRef.current.style.top = `${(spinnerRef.current.clientHeight - containerRef.current.clientHeight) / 2}px`;
        }
      }}
      afterEnter={() => {
        afterVisibleChange?.(true);
      }}
      afterLeave={() => {
        afterVisibleChange?.(false);
      }}
    >
      {(state) => (
        <div
          {...restProps}
          ref={spinnerRef}
          className={getClassName(restProps.className, `${dPrefix}spinner`)}
          style={{
            ...restProps.style,
            ...transitionStyles[state],
          }}
        >
          <div ref={containerRef} className={`${dPrefix}spinner__container`}>
            <div className={`${dPrefix}spinner__icon`} style={{ fontSize: dSize }}>
              {checkNodeExist(children) ? (
                children
              ) : (
                <svg className={`${dPrefix}spinner__spinner`} width="1em" height="1em" viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="21" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></circle>
                </svg>
              )}
            </div>
            {checkNodeExist(dText) && <div className={`${dPrefix}spinner__text`}>{dText}</div>}
          </div>
        </div>
      )}
    </DTransition>
  );
}
