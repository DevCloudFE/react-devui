import type { DTransitionState } from '../_transition';
import type { DFabButtonProps } from './FabButton';
import type { DElementSelector } from '@react-devui/hooks/useElement';

import React, { useRef, useState } from 'react';

import { useElement, useEvent, useIsomorphicLayoutEffect, useResize } from '@react-devui/hooks';
import { VerticalAlignTopOutlined } from '@react-devui/icons';
import { checkNodeExist, scrollTo } from '@react-devui/utils';

import { useComponentConfig, useLayout } from '../../hooks';
import { registerComponentMate, TTANSITION_DURING_BASE } from '../../utils';
import { DTransition } from '../_transition';
import { DFabButton } from './FabButton';

export interface DFabBacktopProps extends DFabButtonProps {
  dPage?: DElementSelector;
  dDistance?: number;
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
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const pageEl = useElement(dPage ?? dScrollEl);
  const resizeEl = useElement(dResizeEl);

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
    if (!pageEl) {
      return;
    }

    setVisible(pageEl.scrollTop >= dDistance);
  };
  useIsomorphicLayoutEffect(() => {
    updateBackTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useResize(resizeEl, updateBackTop);
  useEvent(pageEl, 'scroll', updateBackTop, { passive: true });

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

            if (pageEl) {
              dataRef.current.clearTid?.();
              dataRef.current.clearTid = scrollTo(pageEl, {
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
