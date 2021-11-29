import { useEffect, useMemo } from 'react';
import { Subject } from 'rxjs';

import { useAsync } from './async';
import { useDPrefixConfig } from './d-config';

export function useWave() {
  const dPrefix = useDPrefixConfig();

  const asyncCapture = useAsync();

  const subject$ = useMemo(() => new Subject<[HTMLElement, string, string?]>(), []);

  useEffect(() => {
    const [asyncGroup, asyncId] = asyncCapture.createGroup();

    let removeChild: null | (() => void) = null;

    const ob = subject$.subscribe({
      next: ([el, color, animation]) => {
        asyncGroup.clearAll();
        removeChild?.();

        const cssStyleDeclaration = getComputedStyle(el);

        const waveEl: HTMLDivElement = document.createElement('div');

        waveEl.style.borderTopLeftRadius = cssStyleDeclaration.borderTopLeftRadius;
        waveEl.style.borderTopRightRadius = cssStyleDeclaration.borderTopRightRadius;
        waveEl.style.borderBottomRightRadius = cssStyleDeclaration.borderBottomRightRadius;
        waveEl.style.borderBottomLeftRadius = cssStyleDeclaration.borderBottomLeftRadius;
        waveEl.style.position = 'absolute';
        waveEl.style.zIndex = '-5';
        waveEl.style.top = '0';
        waveEl.style.right = '0';
        waveEl.style.bottom = '0';
        waveEl.style.left = '0';
        waveEl.style.backgroundColor = 'transparent';
        waveEl.style.boxShadow = `0px 0px 0px 0px ${color}`;
        waveEl.style.opacity = '0.2';
        waveEl.style.setProperty(`--${dPrefix}wave-color`, color);
        waveEl.style.animation = animation ?? 'wave 0.4s cubic-bezier(0.08, 0.82, 0.17, 1), wave-fade 2s cubic-bezier(0.08, 0.82, 0.17, 1)';
        waveEl.style.animationFillMode = 'forwards';

        el.appendChild(waveEl);

        removeChild = () => {
          el.removeChild(waveEl);
        };
        asyncGroup.setTimeout(() => {
          removeChild = null;
          el.removeChild(waveEl);
        }, 2000);
      },
    });

    return () => {
      ob.unsubscribe();
      asyncCapture.deleteGroup(asyncId);
    };
  }, [asyncCapture, dPrefix, subject$]);

  return subject$;
}
