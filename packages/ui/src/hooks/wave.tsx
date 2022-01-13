import { useEffect, useMemo, useState } from 'react';
import { Subject } from 'rxjs';

import { usePrefixConfig } from './d-config';

export function useWave() {
  const dPrefix = usePrefixConfig();

  const [node, setNode] = useState<React.ReactNode>(null);
  const [subject] = useState(() => new Subject<{ color: string; animation?: string }>());

  useEffect(() => {
    const ob = subject.subscribe({
      next: ({ color, animation }) => {
        setNode(
          <div
            key={Math.random()}
            className={`${dPrefix}wave`}
            style={{
              [`--${dPrefix}wave-color`]: color,
              animation,
            }}
            onAnimationEnd={(e) => {
              if (e.animationName === 'wave-fade-out') {
                setNode(null);
              }
            }}
          ></div>
        );
      },
    });

    return () => {
      ob.unsubscribe();
    };
  }, [dPrefix, subject]);

  const res = useMemo<[React.ReactNode, (color: string, animation?: string) => void]>(
    () => [
      node,
      (color, animation) => {
        subject.next({ color, animation });
      },
    ],
    [node, subject]
  );

  return res;
}
