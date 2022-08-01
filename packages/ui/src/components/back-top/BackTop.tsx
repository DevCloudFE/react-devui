import type { DElementSelector } from '../../hooks/ui/useElement';
import type { DTransitionState } from '../_transition';

import React, { useEffect, useRef, useState } from 'react';

import {
  usePrefixConfig,
  useComponentConfig,
  useElement,
  useAsync,
  useEventCallback,
  useIsomorphicLayoutEffect,
  useLayout,
} from '../../hooks';
import { VerticalAlignTopOutlined } from '../../icons';
import { registerComponentMate, getClassName, checkNodeExist, scrollTo } from '../../utils';
import { TTANSITION_DURING_BASE } from '../../utils/global';
import { DTransition } from '../_transition';

export interface DBackTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  dPage?: DElementSelector;
  dDistance?: number;
  dScrollBehavior?: 'instant' | 'smooth';
}

const { COMPONENT_NAME } = registerComponentMate({ COMPONENT_NAME: 'DBackTop' });
export function DBackTop(props: DBackTopProps): JSX.Element | null {
  const {
    children,
    dPage,
    dDistance = 400,
    dScrollBehavior = 'instant',

    ...restProps
  } = useComponentConfig(COMPONENT_NAME, props);

  //#region Context
  const dPrefix = usePrefixConfig();
  const { dScrollEl, dResizeEl } = useLayout();
  //#endregion

  const dataRef = useRef<{
    clearTid?: () => void;
  }>({});

  const asyncCapture = useAsync();

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

  const updateBackTop = useEventCallback(() => {
    if (!pageEl) {
      return;
    }

    setVisible(pageEl.scrollTop >= dDistance);
  });
  useIsomorphicLayoutEffect(() => {
    updateBackTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pageEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.fromEvent(pageEl, 'scroll', { passive: true }).subscribe({
        next: () => {
          updateBackTop();
        },
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, pageEl, updateBackTop]);

  useEffect(() => {
    if (resizeEl) {
      const [asyncGroup, asyncId] = asyncCapture.createGroup();

      asyncGroup.onResize(resizeEl, () => {
        updateBackTop();
      });

      return () => {
        asyncCapture.deleteGroup(asyncId);
      };
    }
  }, [asyncCapture, resizeEl, updateBackTop]);

  return (
    <DTransition dIn={visible} dDuring={TTANSITION_DURING_BASE}>
      {(state) => (
        <button
          {...restProps}
          className={getClassName(restProps.className, `${dPrefix}back-top`)}
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
          {checkNodeExist(children) ? children : <VerticalAlignTopOutlined dSize={24} />}
        </button>
      )}
    </DTransition>
  );
}
