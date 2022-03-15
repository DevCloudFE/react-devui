import type { DTransitionProps, DTransitionState } from './Transition';

import { useRef } from 'react';

import { DTransition } from './Transition';

export interface DCollapseTransitionProps extends Omit<DTransitionProps, 'children'> {
  children: (style: React.CSSProperties, state: DTransitionState) => JSX.Element | null;
  dRef: React.RefObject<HTMLElement>;
  dSize: string | number;
  dHorizontal?: boolean;
  dStyles: Partial<Record<DTransitionState, React.CSSProperties>>;
}

export function DCollapseTransition(props: DCollapseTransitionProps): JSX.Element | null {
  const { children, dRef, dSize, dHorizontal = false, dStyles, onEnterRendered, ...restProps } = props;

  const dataRef = useRef<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  return (
    <DTransition
      {...restProps}
      onEnterRendered={() => {
        onEnterRendered?.();

        if (dRef.current) {
          const cssText = dRef.current.style.cssText;

          if (dHorizontal) {
            dRef.current.style.width = '';
            const { width } = dRef.current.getBoundingClientRect();
            dataRef.current.width = width;
          } else {
            dRef.current.style.height = '';
            const { height } = dRef.current.getBoundingClientRect();
            dataRef.current.height = height;
          }

          dRef.current.style.cssText = cssText;
        }
      }}
    >
      {(state) => {
        const transitionStyle: React.CSSProperties = { ...dStyles[state] };
        switch (state) {
          case 'enter':
            Object.assign(transitionStyle, {
              [dHorizontal ? 'width' : 'height']: dSize,
              overflow: 'hidden',
            });
            break;

          case 'entering':
            Object.assign(transitionStyle, {
              [dHorizontal ? 'width' : 'height']: dataRef.current[dHorizontal ? 'width' : 'height'],
              overflow: 'hidden',
            });
            break;

          case 'leave':
            if (dRef.current) {
              const { width, height } = dRef.current.getBoundingClientRect();
              dataRef.current.width = width;
              dataRef.current.height = height;
            }
            Object.assign(transitionStyle, {
              [dHorizontal ? 'width' : 'height']: dataRef.current[dHorizontal ? 'width' : 'height'],
              overflow: 'hidden',
            });
            break;

          case 'leaving':
            Object.assign(transitionStyle, {
              [dHorizontal ? 'width' : 'height']: dSize,
              overflow: 'hidden',
            });
            break;

          case 'leaved':
            Object.assign(transitionStyle, {
              [dHorizontal ? 'width' : 'height']: dSize,
              overflow: 'hidden',
            });
            break;

          default:
            break;
        }

        return children(transitionStyle, state);
      }}
    </DTransition>
  );
}
