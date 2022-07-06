import type { DTransitionProps, DTransitionState } from './Transition';

import { useRef } from 'react';

import { DTransition } from './Transition';

export interface DCollapseTransitionProps extends Omit<DTransitionProps, 'children'> {
  children: (ref: React.RefObject<any>, style: React.CSSProperties, state: DTransitionState) => JSX.Element | null;
  dSize: string | number;
  dHorizontal?: boolean;
  dStyles: Partial<Record<DTransitionState, React.CSSProperties>>;
}

export function DCollapseTransition(props: DCollapseTransitionProps) {
  const { children, dSize, dHorizontal = false, dStyles, onEnterRendered, ...restProps } = props;

  const dataRef = useRef<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const ref = useRef<HTMLElement>(null);

  return (
    <DTransition
      {...restProps}
      onEnterRendered={() => {
        onEnterRendered?.();

        if (ref.current) {
          const cssText = ref.current.style.cssText;

          if (dHorizontal) {
            ref.current.style.width = '';
            const { width } = ref.current.getBoundingClientRect();
            dataRef.current.width = width;
          } else {
            ref.current.style.height = '';
            const { height } = ref.current.getBoundingClientRect();
            dataRef.current.height = height;
          }

          ref.current.style.cssText = cssText;
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
            if (ref.current) {
              const { width, height } = ref.current.getBoundingClientRect();
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

        return children(ref, transitionStyle, state);
      }}
    </DTransition>
  );
}
