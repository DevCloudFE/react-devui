import React, { useEffect, useState } from 'react';

import { usePrefixConfig } from '../d-config';
import { useEventNotify } from '../side-effect';

export function useWave(): [React.ReactNode, (color: string, animation?: string) => void] {
  const dPrefix = usePrefixConfig();

  const wave$ = useEventNotify<{ color: string; animation?: string }>();

  const [node, setNode] = useState<React.ReactNode>(null);

  useEffect(() => {
    const ob = wave$.subscribe({
      next: ({ color, animation }) => {
        setNode(
          React.createElement<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>('div', {
            key: Math.random(),
            className: `${dPrefix}wave`,
            style: {
              [`--${dPrefix}wave-color`]: color,
              animation,
            },
            onAnimationEnd: (e) => {
              if (e.animationName === 'wave-fade-out') {
                setNode(null);
              }
            },
          })
        );
      },
    });

    return () => {
      ob.unsubscribe();
    };
  }, [dPrefix, wave$]);

  return [node, (color, animation) => wave$.next({ color, animation })];
}
