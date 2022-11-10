import type { DTransitionState } from '../_transition';

import { isNumber, isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';

import { useAsync, useForceUpdate } from '@react-devui/hooks';
import { DCustomIcon } from '@react-devui/icons';
import { checkNodeExist, getClassName } from '@react-devui/utils';

import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';
import { useComponentConfig, usePrefixConfig } from '../root';

export interface DSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dText?: React.ReactNode;
  dDelay?: number;
  dSize?: number;
  dAlone?: boolean;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DSpinner' as const });
export function DSpinner(props: DSpinnerProps): JSX.Element | null {
  const {
    children,
    dVisible = true,
    dText,
    dDelay,
    dSize = '28px',
    dAlone = false,
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

  const dataRef = useRef<{
    delayVisible: boolean;
  }>({
    delayVisible: false,
  });

  const async = useAsync();
  const forceUpdate = useForceUpdate();

  if (dVisible === false) {
    dataRef.current.delayVisible = false;
  }
  const visible = isUndefined(dDelay) ? dVisible : dataRef.current.delayVisible;

  useEffect(() => {
    if (isNumber(dDelay) && dVisible) {
      const asyncInstance = async.create();

      asyncInstance.setTimeout(() => {
        dataRef.current.delayVisible = true;
        forceUpdate();
      }, dDelay);

      return () => {
        asyncInstance.clearAll();
      };
    }
  }, [async, dDelay, dVisible, forceUpdate]);

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

  return (
    <DTransition
      dIn={visible}
      dDuring={TTANSITION_DURING_BASE}
      onEnter={() => {
        if (!dAlone && spinnerRef.current && containerRef.current) {
          containerRef.current.style.height = `${spinnerRef.current.clientHeight}px`;
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
          className={getClassName(restProps.className, `${dPrefix}spinner`, {
            [`${dPrefix}spinner--alone`]: dAlone,
          })}
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
                <DCustomIcon className={`${dPrefix}spinner__spinner-icon`} viewBox="0 0 50 50">
                  <circle cx="25" cy="25" r="21" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></circle>
                </DCustomIcon>
              )}
            </div>
            {checkNodeExist(dText) && <div className={`${dPrefix}spinner__text`}>{dText}</div>}
          </div>
        </div>
      )}
    </DTransition>
  );
}
