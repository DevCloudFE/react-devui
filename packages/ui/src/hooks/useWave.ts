import React from 'react';
import { useState } from 'react';

import { usePrefixConfig } from './d-config';

export function useWave(): [React.ReactNode, (color: string, animation?: string) => void] {
  const dPrefix = usePrefixConfig();

  const [node, setNode] = useState<React.ReactNode>(null);

  return [
    node,
    (color, animation) =>
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
      ),
  ];
}
