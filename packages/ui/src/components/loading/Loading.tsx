import type { DTransitionState } from '../_transition';

import { isNumber, isUndefined } from 'lodash';
import { useEffect, useRef } from 'react';

import { usePrefixConfig, useComponentConfig, useAsync, useForceUpdate } from '../../hooks';
import { registerComponentMate, getClassName, checkNodeExist } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DTransition } from '../_transition';

export interface DLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  dVisible?: boolean;
  dText?: React.ReactNode;
  dDelay?: number;
  dSize?: number;
  afterVisibleChange?: (visible: boolean) => void;
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DLoading' });
export function DLoading(props: DLoadingProps): JSX.Element | null {
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
          className={getClassName(restProps.className, `${dPrefix}loading`)}
          style={{
            ...restProps.style,
            ...transitionStyles[state],
          }}
        >
          <div className={`${dPrefix}loading__icon`} style={{ fontSize: dSize }}>
            {checkNodeExist(children) ? (
              children
            ) : (
              <svg className={`${dPrefix}loading__spinner`} width="1em" height="1em" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></circle>
              </svg>
            )}
          </div>
          {checkNodeExist(dText) && <div className={`${dPrefix}loading__text`}>{dText}</div>}
        </div>
      )}
    </DTransition>
  );
}
