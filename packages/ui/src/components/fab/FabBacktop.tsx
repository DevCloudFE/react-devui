import type { DTransitionState } from '../_transition';
import type { DFabButtonProps } from './FabButton';
import type { DRefExtra } from '@react-devui/hooks/useRefExtra';

import { isString } from 'lodash';
import React, { useRef, useState } from 'react';

import { useEvent, useIsomorphicLayoutEffect, useRefExtra, useResize } from '@react-devui/hooks';
import { VerticalAlignTopOutlined } from '@react-devui/icons';
import { checkNodeExist, scrollTo, toPx } from '@react-devui/utils';

import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';
import { useComponentConfig, useGlobalScroll, useLayout } from '../root';
import { DFabButton } from './FabButton';

export interface DFabBacktopProps extends DFabButtonProps {
  dPage?: DRefExtra;
  dDistance?: number | string;
  dScrollBehavior?: 'instant' | 'smooth';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DFab.Backtop' as const });
function FabBacktop(props: DFabBacktopProps, ref: React.ForwardedRef<HTMLButtonElement>): JSX.Element | null {
  const {
    children,
    dPage,
    dDistance = 400,
    dScrollBehavior = 'instant',

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const { dPageScrollRef, dContentResizeRef } = useLayout();
  //#endregion

  //#region Ref
  const pageRef = useRefExtra(dPage ?? (() => dPageScrollRef.current));
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const [visible, setVisible] = useState(false);

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

  const updateBackTop = () => {
    if (pageRef.current) {
      const distance = isString(dDistance) ? toPx(dDistance, true) : dDistance;
      setVisible(pageRef.current.scrollTop >= distance);
    }
  };
  useIsomorphicLayoutEffect(() => {
    updateBackTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const globalScroll = useGlobalScroll(updateBackTop);
  useEvent(pageRef, 'scroll', updateBackTop, { passive: true }, globalScroll);

  useResize(dContentResizeRef, updateBackTop);

  return (
    <DTransition dIn={visible} dDuring={TTANSITION_DURING_BASE}>
      {(state) => (
        <DFabButton
          {...restProps}
          ref={ref}
          style={{
            ...restProps.style,
            ...transitionStyles[state],
          }}
          onClick={(e) => {
            restProps.onClick?.(e);

            if (pageRef.current) {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = scrollTo(pageRef.current, {
                top: 0,
                behavior: dScrollBehavior,
              });
            }
          }}
        >
          {checkNodeExist(children) ? children : <VerticalAlignTopOutlined />}
        </DFabButton>
      )}
    </DTransition>
  );
}

export const DFabBacktop = React.forwardRef(FabBacktop);
