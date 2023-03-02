import type { DTransitionProps, DTransitionState } from './Transition';

import { isNumber, isUndefined } from 'lodash';
import { useRef } from 'react';

import { DTransition } from './Transition';

export interface DCollapseTransitionProps extends Omit<DTransitionProps, 'children'> {
  children: (ref: React.RefObject<any>, style: React.CSSProperties, state: DTransitionState) => JSX.Element | null;
  dOriginalSize?: {
    width?: string | number;
    height?: string | number;
    padding?: [string | number, string | number, string | number, string | number];
  };
  dCollapsedStyle?: {
    width?: string | number;
    height?: string | number;
    padding?: [string | number, string | number, string | number, string | number];
    margin?: [string | number, string | number, string | number, string | number];
  };
  dStyles: Partial<Record<DTransitionState, React.CSSProperties>>;
  dSize?: any;
  dHorizontal?: any;
}

export function DCollapseTransition(props: DCollapseTransitionProps): JSX.Element | null {
  const {
    children,
    dStyles,

    ...restProps
  } = props;

  const [dOriginalSize, dCollapsedStyle] = [restProps.dOriginalSize!, restProps.dCollapsedStyle!];

  const ref = useRef<HTMLElement>(null);

  const dataRef = useRef<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  const isHorizontal = !isUndefined(dOriginalSize.width);

  const getSizeStyle = (val: string | number | undefined) => (isUndefined(val) ? '' : isNumber(val) ? `${val}px` : val);

  return (
    <DTransition
      {...restProps}
      onEnter={() => {
        restProps.onEnter?.();

        if (ref.current) {
          if (dOriginalSize.width === 'auto') {
            const cssText = ref.current.style.cssText;
            ref.current.style.width = 'auto';
            ref.current.style.paddingLeft = getSizeStyle(dOriginalSize.padding?.[3]);
            ref.current.style.paddingRight = getSizeStyle(dOriginalSize.padding?.[1]);
            dataRef.current.width = ref.current.offsetWidth;
            ref.current.style.cssText = cssText;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            ref.current.offsetTop;
          } else if (dOriginalSize.height === 'auto') {
            const cssText = ref.current.style.cssText;
            ref.current.style.height = 'auto';
            ref.current.style.paddingTop = getSizeStyle(dOriginalSize.padding?.[0]);
            ref.current.style.paddingBottom = getSizeStyle(dOriginalSize.padding?.[2]);
            dataRef.current.height = ref.current.offsetHeight;
            ref.current.style.cssText = cssText;
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            ref.current.offsetTop;
          }
        }
      }}
    >
      {(state) => {
        const transitionStyle: React.CSSProperties = { ...dStyles[state] };

        const originalSize: React.CSSProperties = {
          [isHorizontal ? 'width' : 'height']: isHorizontal
            ? dOriginalSize.width === 'auto'
              ? dataRef.current.width
              : dOriginalSize.width
            : dOriginalSize.height === 'auto'
            ? dataRef.current.height
            : dOriginalSize.height,
        };
        if (!isUndefined(dOriginalSize.padding)) {
          originalSize.padding = dOriginalSize.padding.map((p) => getSizeStyle(p)).join(' ');
        }

        const collapsedStyle: React.CSSProperties = Object.assign(
          {
            [isHorizontal ? 'width' : 'height']: dCollapsedStyle[isHorizontal ? 'width' : 'height'],
            overflow: 'hidden',
          },
          isHorizontal
            ? {
                paddingLeft: dCollapsedStyle.padding?.[3] ?? 0,
                paddingRight: dCollapsedStyle.padding?.[1] ?? 0,
                marginLeft: dCollapsedStyle.margin?.[3] ?? 0,
                marginRight: dCollapsedStyle.margin?.[1] ?? 0,
              }
            : {
                paddingTop: dCollapsedStyle.padding?.[0] ?? 0,
                paddingBottom: dCollapsedStyle.padding?.[2] ?? 0,
                marginTop: dCollapsedStyle.margin?.[0] ?? 0,
                marginBottom: dCollapsedStyle.margin?.[2] ?? 0,
              }
        );

        switch (state) {
          case 'enter':
            Object.assign(transitionStyle, collapsedStyle);
            break;

          case 'entering':
            Object.assign(transitionStyle, originalSize, {
              overflow: 'hidden',
            });
            break;

          case 'leave':
            if (originalSize[isHorizontal ? 'width' : 'height'] === 0) {
              originalSize[isHorizontal ? 'width' : 'height'] = ref.current?.[isHorizontal ? 'offsetWidth' : 'offsetHeight'];
            }
            Object.assign(transitionStyle, originalSize, {
              overflow: 'hidden',
            });
            break;

          case 'leaving':
            Object.assign(transitionStyle, collapsedStyle);
            break;

          case 'leaved':
            Object.assign(transitionStyle, collapsedStyle, {
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
